// Audio Voice Recording & Video Capture Service for SETU Platform
// Provides WebRTC MediaRecorder-based audio/video capture for citizen challenge submissions.
// Supports native Android (Capacitor) and browser PWA environments.
// Privacy: recordings are processed entirely on-device; no raw streams are sent to third parties.

const AUDIO_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4'
];

const VIDEO_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4'
];

/**
 * Picks the first MIME type supported by this browser's MediaRecorder.
 */
function pickSupportedMime(candidates) {
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find(m => MediaRecorder.isTypeSupported(m)) || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO VOICE RECORDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AudioRecorder — encapsulates a single recording session.
 *
 * Usage:
 *   const recorder = new AudioRecorder();
 *   await recorder.start();
 *   // ... user speaks ...
 *   const blob = await recorder.stop();   // Blob{ type: 'audio/webm' }
 *   recorder.dispose();
 */
export class AudioRecorder {
  constructor() {
    this._stream = null;
    this._recorder = null;
    this._chunks = [];
    this._mimeType = '';
    this._startTime = null;
    this.onTimeUpdate = null; // callback(elapsedSeconds: number)
    this._timerHandle = null;
  }

  get isRecording() {
    return this._recorder?.state === 'recording';
  }

  get elapsedSeconds() {
    if (!this._startTime) return 0;
    return Math.floor((Date.now() - this._startTime) / 1000);
  }

  async start({ maxDurationMs = 120_000 } = {}) {
    if (this._recorder && this._recorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    this._stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    this._mimeType = pickSupportedMime(AUDIO_MIME_TYPES);
    const options = this._mimeType ? { mimeType: this._mimeType } : {};
    this._recorder = new MediaRecorder(this._stream, options);
    this._chunks = [];

    this._recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) this._chunks.push(e.data);
    };

    // Collect data every second to support streaming previews
    this._recorder.start(1000);
    this._startTime = Date.now();

    // Enforce maximum duration
    if (maxDurationMs > 0) {
      this._maxDurationHandle = setTimeout(() => this.stop(), maxDurationMs);
    }

    // Tick the elapsed-time callback
    if (typeof this.onTimeUpdate === 'function') {
      this._timerHandle = setInterval(() => {
        this.onTimeUpdate(this.elapsedSeconds);
      }, 1000);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this._recorder || this._recorder.state === 'inactive') {
        return resolve(null);
      }

      clearTimeout(this._maxDurationHandle);
      clearInterval(this._timerHandle);

      this._recorder.onstop = () => {
        try {
          const blob = new Blob(this._chunks, {
            type: this._mimeType || 'audio/webm'
          });
          resolve(blob);
        } catch (e) {
          reject(e);
        }
      };

      this._recorder.stop();
    });
  }

  pause() {
    if (this._recorder?.state === 'recording') {
      this._recorder.pause();
      clearInterval(this._timerHandle);
    }
  }

  resume() {
    if (this._recorder?.state === 'paused') {
      this._recorder.resume();
      if (typeof this.onTimeUpdate === 'function') {
        this._timerHandle = setInterval(() => {
          this.onTimeUpdate(this.elapsedSeconds);
        }, 1000);
      }
    }
  }

  dispose() {
    clearTimeout(this._maxDurationHandle);
    clearInterval(this._timerHandle);
    if (this._recorder && this._recorder.state !== 'inactive') {
      this._recorder.stop();
    }
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
    this._recorder = null;
    this._chunks = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO CAPTURE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VideoRecorder — records video (with audio) from the device camera.
 *
 * Usage:
 *   const recorder = new VideoRecorder();
 *   const stream = await recorder.start({ facingMode: 'environment' });
 *   // Attach stream to a <video> element for live preview:
 *   videoElement.srcObject = stream;
 *   // ... user records ...
 *   const blob = await recorder.stop();   // Blob{ type: 'video/webm' }
 *   recorder.dispose();
 */
export class VideoRecorder {
  constructor() {
    this._stream = null;
    this._recorder = null;
    this._chunks = [];
    this._mimeType = '';
    this._startTime = null;
    this.onTimeUpdate = null;
    this._timerHandle = null;
  }

  get isRecording() {
    return this._recorder?.state === 'recording';
  }

  get elapsedSeconds() {
    if (!this._startTime) return 0;
    return Math.floor((Date.now() - this._startTime) / 1000);
  }

  /**
   * Opens the camera stream and starts recording.
   * Returns the raw MediaStream so callers can attach it to a <video> element.
   */
  async start({ facingMode = 'environment', maxDurationMs = 300_000 } = {}) {
    if (this._recorder && this._recorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    this._stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    this._mimeType = pickSupportedMime(VIDEO_MIME_TYPES);
    const options = this._mimeType ? { mimeType: this._mimeType } : {};
    this._recorder = new MediaRecorder(this._stream, options);
    this._chunks = [];

    this._recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) this._chunks.push(e.data);
    };

    this._recorder.start(1000);
    this._startTime = Date.now();

    if (maxDurationMs > 0) {
      this._maxDurationHandle = setTimeout(() => this.stop(), maxDurationMs);
    }

    if (typeof this.onTimeUpdate === 'function') {
      this._timerHandle = setInterval(() => {
        this.onTimeUpdate(this.elapsedSeconds);
      }, 1000);
    }

    // Return the stream so callers can render a live preview
    return this._stream;
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this._recorder || this._recorder.state === 'inactive') {
        return resolve(null);
      }

      clearTimeout(this._maxDurationHandle);
      clearInterval(this._timerHandle);

      this._recorder.onstop = () => {
        try {
          const blob = new Blob(this._chunks, {
            type: this._mimeType || 'video/webm'
          });
          resolve(blob);
        } catch (e) {
          reject(e);
        }
      };

      this._recorder.stop();
    });
  }

  dispose() {
    clearTimeout(this._maxDurationHandle);
    clearInterval(this._timerHandle);
    if (this._recorder && this._recorder.state !== 'inactive') {
      this._recorder.stop();
    }
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
    this._recorder = null;
    this._chunks = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a Blob to a base64-encoded data URL.
 * Useful for persisting recordings in IndexedDB or sending as JSON payloads.
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Formats elapsed seconds as MM:SS for display in UI recording timers.
 */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Returns true if the current environment supports audio recording via MediaRecorder.
 */
export function isAudioRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined' &&
    pickSupportedMime(AUDIO_MIME_TYPES) !== ''
  );
}

/**
 * Returns true if the current environment supports video recording via MediaRecorder.
 */
export function isVideoRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined' &&
    pickSupportedMime(VIDEO_MIME_TYPES) !== ''
  );
}
