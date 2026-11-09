import { useEffect, useRef, useState } from "react";
import "./AssistantOrb.css";

const VALID_STATES = new Set([
  "idle",
  "hover",
  "thinking",
  "listening",
  "success",
  "inactive",
]);

// Static image fallback only. The primary implementation is WebGL.
const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="pearl" cx="36%" cy="28%" r="76%">
      <stop stop-color="#fff" stop-opacity=".98"/>
      <stop offset=".38" stop-color="#ece9f3" stop-opacity=".95"/>
      <stop offset=".68" stop-color="#ddd8e9" stop-opacity=".94"/>
      <stop offset="1" stop-color="#9aabbc" stop-opacity=".9"/>
    </radialGradient>
    <radialGradient id="pink">
      <stop stop-color="#f1cbdc" stop-opacity=".55"/>
      <stop offset="1" stop-color="#f1cbdc" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cyan">
      <stop stop-color="#c9e9eb" stop-opacity=".55"/>
      <stop offset="1" stop-color="#c9e9eb" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="120" cy="218" rx="54" ry="7" fill="#000" opacity=".2"/>
  <circle cx="120" cy="116" r="91" fill="url(#pearl)"/>
  <ellipse cx="147" cy="143" rx="60" ry="55" fill="url(#pink)"/>
  <ellipse cx="83" cy="139" rx="51" ry="65" fill="url(#cyan)"/>
  <path d="M58 75 Q83 36 123 37" fill="none" stroke="#fff"
    stroke-width="4" stroke-linecap="round" opacity=".5"/>
  <ellipse cx="96" cy="113" rx="4" ry="5.5" fill="#272b3d"/>
  <ellipse cx="143" cy="113" rx="4" ry="5.5" fill="#272b3d"/>
  <path d="M111 137 Q120 143 129 137" fill="none" stroke="#34364a"
    stroke-width="2.3" stroke-linecap="round"/>
  <ellipse cx="80" cy="129" rx="7" ry="3" fill="#d99fb7" opacity=".25"/>
  <ellipse cx="159" cy="129" rx="7" ry="3" fill="#d99fb7" opacity=".25"/>
</svg>
`)}`;

const CORE_VERTEX = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vView;

void main() {
    vLocal = normalize(position);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uWake;
  uniform float uHover;
  uniform float uThinking;
  uniform float uListening;
  uniform float uSuccess;
  uniform vec2 uPointer;

varying vec3 vLocal;
  varying vec3 vNormalView;
  varying vec3 vView;

void main() {
    vec3 n = normalize(vLocal);

    float orbit = uTime * mix(0.17, 0.56, uThinking);
    vec3 a = normalize(vec3(
      cos(orbit) * 0.58 + uPointer.x * 0.12,
      sin(orbit * 0.83) * 0.43 + uPointer.y * 0.09,
      0.8
    ));
    vec3 b = normalize(vec3(
      sin(orbit + 2.1) * 0.7,
      cos(orbit * 0.7) * 0.55,
      0.55
    ));

    float lavenderField = pow(max(dot(n, a), 0.0), 3.0);
    float pinkField = pow(max(dot(n, b), 0.0), 4.0);
    float cyanField = pow(max(dot(
      n, normalize(vec3(-0.8, -0.25, 0.7))
    ), 0.0), 3.0);

    vec3 pearl = vec3(0.78, 0.79, 0.84);
    vec3 color = pearl;
    color = mix(color, vec3(0.75, 0.72, 0.86), lavenderField * 0.20);
    color = mix(color, vec3(0.91, 0.76, 0.82), pinkField * 0.16);
    color = mix(color, vec3(0.68, 0.85, 0.88), cyanField * 0.13);

    float facing = max(dot(normalize(vNormalView), normalize(vView)), 0.0);
    color *= 0.79 + 0.21 * facing;

    float listeningBreath = 0.5 + 0.5 * sin(uTime * 1.65);
    vec3 listeningColor = mix(
      vec3(0.66, 0.86, 0.90),
      vec3(0.90, 0.73, 0.84),
      listeningBreath
    );
    color = mix(color, listeningColor, uListening * 0.12);

    float thinkingLight = pow(max(dot(n, a), 0.0), 12.0);
    color += thinkingLight * uThinking * vec3(0.055, 0.045, 0.07);

    float successEnvelope = sin(uSuccess * 3.14159265);
    float wavePosition = mix(-1.3, 1.3, uSuccess);
    float wave = exp(-pow((n.x - wavePosition) / 0.17, 2.0));
    color += wave * successEnvelope * 0.16;
    color += successEnvelope * 0.045;

    float brightness = mix(0.035, 1.0, uWake);
    brightness *= 1.0 + uHover * 0.065;
    brightness *= 1.0 + uListening * listeningBreath * 0.035;

    gl_FragColor = vec4(color * brightness, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const HALO_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HALO_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  uniform float uListening;
  uniform float uTime;
  varying vec2 vUv;

void main() {
    float radius = length((vUv - 0.5) * 2.0);
    float ring = exp(-pow((radius - 0.77) / 0.105, 2.0));
    float cutoff = 1.0 - smoothstep(0.92, 1.0, radius);
    vec3 color = mix(
      vec3(0.81, 0.78, 0.91),
      mix(
        vec3(0.69, 0.88, 0.93),
        vec3(0.94, 0.76, 0.85),
        0.5 + 0.5 * sin(uTime * 1.65)
      ),
      uListening * 0.65
    );
    gl_FragColor = vec4(color, ring * cutoff * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function AssistantOrb({
  state = "idle",
  size = 100,
  successKey = 0,
  onSuccessComplete,
  onActivate,
  environment = null,
  groundShadow = false,
  label = "HERE student support assistant",
  className = "",
  style,
}) {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const latestRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  const safeState = VALID_STATES.has(state) ? state : "idle";
  const safeSize = Number.isFinite(size)
    ? Math.max(48, Math.min(220, size))
    : 100;

  latestRef.current = {
    state: safeState,
    size: safeSize,
    successKey,
    onSuccessComplete,
    environment,
    groundShadow,
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let loading = false;
    let inViewport = false;
    let teardown = () => {};
    let visibilityObserver;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function syncActivity() {
      engineRef.current?.setActive(
        inViewport && document.visibilityState === "visible"
      );
    }

    async function boot() {
      if (loading || disposed) return;
      loading = true;

      let renderer;

      try {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);

        if (disposed) return;

        const reduced = () => motionQuery.matches;
        const compact = window.matchMedia(
          "(max-width: 767px), (pointer: coarse)"
        ).matches;

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });

        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.04;

        const canvas = renderer.domElement;
        canvas.className = "here-orb__canvas";
        canvas.setAttribute("aria-hidden", "true");
        host.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
        camera.position.set(0, 0, 5.5);

        const geometries = new Set();
        const materials = new Set();
        const textures = new Set();

        const ownGeometry = (value) => {
          geometries.add(value);
          return value;
        };
        const ownMaterial = (value) => {
          materials.add(value);
          return value;
        };

        let roomTarget = null;
        if (!latestRef.current.environment) {
          const room = new RoomEnvironment();
          const pmrem = new THREE.PMREMGenerator(renderer);
          roomTarget = pmrem.fromScene(room, 0.06);
          room.dispose();
          pmrem.dispose();
        }

        scene.environment =
          latestRef.current.environment || roomTarget?.texture || null;

        const ambient = new THREE.HemisphereLight(0xe9edff, 0x777086, 1.1);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xfff3f6, 2.7);
        key.position.set(-3, 4, 5);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xd8f1ff, 1.1);
        fill.position.set(3, 0.5, 3);
        scene.add(fill);

        const body = new THREE.Group();
        scene.add(body);

        const detail = compact ? 40 : 56;
        const sphereGeometry = ownGeometry(
          new THREE.SphereGeometry(1, detail, compact ? 28 : 40)
        );

        const roughCanvas = document.createElement("canvas");
        roughCanvas.width = roughCanvas.height = 128;
        const ctx = roughCanvas.getContext("2d");
        const roughImage = ctx.createImageData(128, 128);

        for (let y = 0; y < 128; y++) {
          for (let x = 0; x < 128; x++) {
            const u = (x / 128) * Math.PI * 2;
            const v = (y / 128) * Math.PI;
            const field =
              0.56 +
              Math.sin(u * 2 + Math.sin(v * 2)) * Math.sin(v) * 0.26 +
              Math.cos(u * 3 - v) * Math.sin(v) * 0.1;
            const value = Math.round(
              THREE.MathUtils.clamp(field, 0.18, 0.95) * 255
            );
            const i = (y * 128 + x) * 4;
            roughImage.data[i] = value;
            roughImage.data[i + 1] = value;
            roughImage.data[i + 2] = value;
            roughImage.data[i + 3] = 255;
          }
        }

        ctx.putImageData(roughImage, 0, 0);
        const roughnessMap = new THREE.CanvasTexture(roughCanvas);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        textures.add(roughnessMap);

        const uniforms = {
          uTime: { value: 0 },
          uWake: { value: safeState === "inactive" ? 0 : 1 },
          uHover: { value: 0 },
          uThinking: { value: 0 },
          uListening: { value: 0 },
          uSuccess: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        };

        const coreMaterial = ownMaterial(
          new THREE.ShaderMaterial({
            uniforms,
            vertexShader: CORE_VERTEX,
            fragmentShader: CORE_FRAGMENT,
          })
        );

        const core = new THREE.Mesh(sphereGeometry, coreMaterial);
        core.scale.setScalar(0.87);
        body.add(core);

        const glassMaterial = ownMaterial(
          new THREE.MeshPhysicalMaterial({
            color: 0xf6f3fc,
            metalness: 0,
            roughness: 0.31,
            roughnessMap,
            transmission: 0.78,
            thickness: 0.24,
            ior: 1.34,
            clearcoat: 1,
            clearcoatRoughness: 0.085,
            attenuationColor: new THREE.Color(0xe8e3f1),
            attenuationDistance: 3.8,
            envMapIntensity: 0.68,
            transparent: true,
            opacity: 0.97,
          })
        );

        const ripple = {
          time: { value: 0 },
          amplitude: { value: 0 },
        };

        glassMaterial.onBeforeCompile = (shader) => {
          shader.uniforms.uRippleTime = ripple.time;
          shader.uniforms.uRippleAmplitude = ripple.amplitude;

          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
               uniform float uRippleTime;
               uniform float uRippleAmplitude;`
            )
            .replace(
              "#include <normal_fragment_maps>",
              `#include <normal_fragment_maps>
               float band =
                 vViewPosition.y * 20.0 - uRippleTime * 10.0;
               normal = normalize(normal + vec3(
                 sin(band),
                 cos(band * 0.85),
                 0.0
               ) * uRippleAmplitude);`
            );
        };
        glassMaterial.customProgramCacheKey = () => "here-glass-ripple-v1";

        const shell = new THREE.Mesh(sphereGeometry, glassMaterial);
        body.add(shell);

        const face = new THREE.Group();
        face.renderOrder = 3;
        body.add(face);

        const eyeMaterial = ownMaterial(
          new THREE.MeshPhysicalMaterial({
            color: 0x232638,
            metalness: 0,
            roughness: 0.18,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            transparent: true,
          })
        );

        const smileMaterial = ownMaterial(
          new THREE.MeshStandardMaterial({
            color: 0x37384b,
            roughness: 0.48,
            transparent: true,
          })
        );

        function onSurface(mesh, x, y, radius = 1.012) {
          const z = Math.sqrt(Math.max(0, radius * radius - x * x - y * y));
          mesh.position.set(x, y, z);
          mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            mesh.position.clone().normalize()
          );
          mesh.renderOrder = 3;
          face.add(mesh);
        }

        const eyeGeometry = ownGeometry(new THREE.SphereGeometry(1, 16, 12));

        for (const x of [-0.235, 0.235]) {
          const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
          eye.scale.set(0.035, 0.048, 0.015);
          onSurface(eye, x, 0.065);
        }

        const smilePoints = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const x = (t - 0.5) * 0.19;
          const y = -0.17 - Math.sin(t * Math.PI) * 0.028;
          const z = Math.sqrt(1.014 ** 2 - x * x - y * y);
          smilePoints.push(new THREE.Vector3(x, y, z));
        }

        const smile = new THREE.Mesh(
          ownGeometry(
            new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3(smilePoints),
              24,
              0.009,
              6,
              false
            )
          ),
          smileMaterial
        );
        smile.renderOrder = 3;
        face.add(smile);

        const cheekMaterial = ownMaterial(
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: { uOpacity: { value: 0.2 } },
            vertexShader: HALO_VERTEX,
            fragmentShader: `
              uniform float uOpacity;
              varying vec2 vUv;
              void main() {
                float d = length((vUv - 0.5) * 2.0);
                float a = exp(-d * d * 4.0)
                        * (1.0 - smoothstep(0.65, 1.0, d));
                gl_FragColor = vec4(0.78, 0.39, 0.52, a * uOpacity);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
              }
            `,
          })
        );

        const cheekGeometry = ownGeometry(new THREE.PlaneGeometry(0.17, 0.075));
        for (const x of [-0.38, 0.38]) {
          onSurface(
            new THREE.Mesh(cheekGeometry, cheekMaterial),
            x,
            -0.105,
            1.019
          );
        }

        const haloUniforms = {
          uOpacity: { value: 0.045 },
          uListening: { value: 0 },
          uTime: { value: 0 },
        };
        const halo = new THREE.Mesh(
          ownGeometry(new THREE.PlaneGeometry(2.64, 2.64)),
          ownMaterial(
            new THREE.ShaderMaterial({
              uniforms: haloUniforms,
              vertexShader: HALO_VERTEX,
              fragmentShader: HALO_FRAGMENT,
              transparent: true,
              depthWrite: false,
            })
          )
        );
        halo.position.z = -0.3;
        halo.renderOrder = -1;
        scene.add(halo);

        const shadowMaterial = ownMaterial(
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: { uOpacity: { value: 0.22 } },
            vertexShader: HALO_VERTEX,
            fragmentShader: `
              uniform float uOpacity;
              varying vec2 vUv;
              void main() {
                float d = length((vUv - 0.5) * 2.0);
                float a = exp(-d * d * 3.5)
                        * (1.0 - smoothstep(0.6, 1.0, d));
                gl_FragColor = vec4(0.0, 0.0, 0.0, a * uOpacity);
              }
            `,
          })
        );

        const shadow = new THREE.Mesh(
          ownGeometry(new THREE.PlaneGeometry(1.5, 0.23)),
          shadowMaterial
        );
        shadow.position.set(0, -1.045, -0.1);
        shadow.renderOrder = -2;
        scene.add(shadow);

        const pointerTarget = new THREE.Vector2();
        const pointer = new THREE.Vector2();
        const rayPointer = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        let directHover = false;
        let focused = false;
        let active = false;
        let raf = 0;
        let previousTime = 0;
        let elapsed = 0;
        let previousState = null;
        let previousSuccessKey;
        let successAge = Infinity;
        let hoverAge = Infinity;
        let previousHover = false;

        function resize() {
          const rect = canvas.getBoundingClientRect();
          if (!rect.width || !rect.height) return;

          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.75)
          );
          renderer.setSize(rect.width, rect.height, false);

          camera.aspect = rect.width / rect.height;
          camera.fov = THREE.MathUtils.radToDeg(
            2 * Math.atan(1.28 / camera.position.z)
          );
          camera.updateProjectionMatrix();

          if (active) renderStill();
        }

        function renderStill() {
          renderer.render(scene, camera);
        }

        function move(event) {
          if (event.pointerType === "touch" || !active) return;

          const rect = canvas.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const proximity = Math.max(160, rect.width * 1.8);
          const dx = event.clientX - centerX;
          const dy = event.clientY - centerY;

          if (Math.hypot(dx, dy) > proximity) {
            pointerTarget.set(0, 0);
            directHover = false;
            return;
          }

          pointerTarget.set(
            THREE.MathUtils.clamp(dx / proximity, -1, 1),
            THREE.MathUtils.clamp(-dy / proximity, -1, 1)
          );

          rayPointer.set((dx / rect.width) * 2, (-dy / rect.height) * 2);
          scene.updateMatrixWorld(true);
          camera.updateMatrixWorld(true);
          raycaster.setFromCamera(rayPointer, camera);
          directHover = raycaster.intersectObject(shell, false).length > 0;
        }

        function resetPointer() {
          pointerTarget.set(0, 0);
          directHover = false;
        }

        const focusIn = () => {
          focused = true;
        };
        const focusOut = () => {
          focused = false;
        };

        function frame(now) {
          if (!active || disposed) return;

          const dt = Math.min(
            previousTime ? (now - previousTime) / 1000 : 1 / 60,
            0.05
          );
          previousTime = now;

          const config = latestRef.current;
          const state = config.state;
          const reduceMotion = reduced();

          if (!reduceMotion) elapsed += dt;

          if (
            state === "success" &&
            (previousState !== "success" ||
              previousSuccessKey !== config.successKey)
          ) {
            successAge = 0;
          } else if (state !== "success") {
            successAge = Infinity;
          }

          previousState = state;
          previousSuccessKey = config.successKey;

          let successProgress = 0;
          if (Number.isFinite(successAge)) {
            successAge += dt;
            successProgress = Math.min(successAge / 0.72, 1);
            if (successAge >= 0.72) {
              successAge = Infinity;
              queueMicrotask(() => {
                if (!disposed) latestRef.current.onSuccessComplete?.();
              });
            }
          }

          const inactive = state === "inactive";
          const hovering =
            !inactive && (state === "hover" || directHover || focused);

          if (hovering && !previousHover) hoverAge = 0;
          previousHover = hovering;
          hoverAge += dt;

          const ease = 1 - Math.exp(-dt / 0.133);
          const wakeEase = 1 - Math.exp(-dt / 0.22);
          const damp = (uniform, target, amount = ease) => {
            uniform.value += (target - uniform.value) * amount;
          };

          damp(uniforms.uWake, inactive ? 0 : 1, wakeEase);
          damp(uniforms.uHover, hovering ? 1 : 0);
          damp(uniforms.uThinking, state === "thinking" ? 1 : 0);
          damp(uniforms.uListening, state === "listening" ? 1 : 0);

          const wake = uniforms.uWake.value;
          const hover = uniforms.uHover.value;
          const thinking = uniforms.uThinking.value;
          const listening = uniforms.uListening.value;

          pointer.lerp(pointerTarget, ease);
          uniforms.uPointer.value.copy(pointer);
          uniforms.uTime.value = elapsed;
          uniforms.uSuccess.value = successProgress;

          const breath = reduceMotion
            ? 0
            : 0.5 - 0.5 * Math.cos((elapsed * Math.PI * 2) / 3.8);

          const floatCycle = reduceMotion
            ? 0
            : 0.5 - 0.5 * Math.cos((elapsed * Math.PI * 2) / 5.2);

          const pulse = reduceMotion
            ? 0
            : (0.5 - 0.5 * Math.cos(elapsed * 1.8)) * thinking * 0.003;

          body.scale.setScalar(1 + wake * (breath * 0.015 + pulse));

          const unitsPerPixel = 2 / config.size;
          const floatPixels = Math.min(4, config.size * 0.028);
          const follow = reduceMotion ? 0 : wake;

          body.position.x = pointer.x * 1.3 * unitsPerPixel * follow;
          body.position.y =
            (floatCycle * floatPixels * (1 + hover * 0.12) +
              pointer.y * 0.7) *
            unitsPerPixel *
            follow;

          body.rotation.y = pointer.x * 0.065 * follow;
          body.rotation.x = -pointer.y * 0.045 * follow;

          halo.position.x = body.position.x;
          halo.position.y = body.position.y;

          const listenBreath = reduceMotion
            ? 0.5
            : 0.5 + 0.5 * Math.sin(elapsed * 1.65);

          halo.scale.setScalar(1 + listening * listenBreath * 0.025);
          haloUniforms.uTime.value = elapsed;
          haloUniforms.uListening.value = listening;
          haloUniforms.uOpacity.value =
            0.045 *
            wake *
            (1 + hover * 0.12 + listening * listenBreath * 0.16);

          eyeMaterial.opacity = 0.045 + wake * 0.955;
          smileMaterial.opacity = 0.035 + wake * 0.965;
          eyeMaterial.color.setRGB(
            0.017 + hover * 0.012,
            0.020 + hover * 0.014,
            0.038 + hover * 0.016
          );
          cheekMaterial.uniforms.uOpacity.value = wake * 0.2;

          glassMaterial.envMapIntensity = 0.055 + wake * 0.625;
          ambient.intensity = 0.05 + wake * 1.05;
          key.intensity = 0.08 + wake * 2.62;
          fill.intensity = 0.025 + wake * 1.075;

          key.position.x = -3 + pointer.x * 0.45 * wake;
          key.position.y = 4 + pointer.y * 0.3 * wake;
          fill.position.x = 3 - pointer.x * 0.3 * wake;

          ripple.time.value = hoverAge;
          ripple.amplitude.value =
            reduceMotion || hoverAge > 0.9
              ? 0
              : Math.sin((hoverAge / 0.9) * Math.PI) * 0.007 * hover;

          shadow.visible = config.groundShadow;
          shadowMaterial.uniforms.uOpacity.value =
            0.22 - floatCycle * 0.035 * wake;

          scene.environment =
            config.environment || roomTarget?.texture || null;

          renderer.render(scene, camera);
          raf = requestAnimationFrame(frame);
        }

        function setActive(next) {
          if (active === next) return;
          active = next;

          if (active) {
            previousTime = 0;
            raf = requestAnimationFrame(frame);
          } else {
            cancelAnimationFrame(raf);
            resetPointer();
          }
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);

        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("blur", resetPointer);
        document.addEventListener("pointerleave", resetPointer);
        host.addEventListener("focusin", focusIn);
        host.addEventListener("focusout", focusOut);

        function contextLost(event) {
          event.preventDefault();
          setActive(false);
          if (!disposed) setFallback(true);
        }

        canvas.addEventListener("webglcontextlost", contextLost);

        engineRef.current = { setActive };

        teardown = () => {
          setActive(false);
          resizeObserver.disconnect();
          window.removeEventListener("pointermove", move);
          window.removeEventListener("blur", resetPointer);
          document.removeEventListener("pointerleave", resetPointer);
          host.removeEventListener("focusin", focusIn);
          host.removeEventListener("focusout", focusOut);
          canvas.removeEventListener("webglcontextlost", contextLost);

          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          textures.forEach((texture) => texture.dispose());
          roomTarget?.dispose();
          renderer.dispose();
          canvas.remove();
          engineRef.current = null;
        };

        resize();
        syncActivity();
      } catch (error) {
        renderer?.dispose();
        renderer?.domElement.remove();
        if (!disposed) setFallback(true);
        console.warn("HERE orb: using static fallback.", error);
      }
    }

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport) boot();
        syncActivity();
      },
      { rootMargin: "0px", threshold: 0 }
    );

    visibilityObserver.observe(host);
    document.addEventListener("visibilitychange", syncActivity);

    return () => {
      disposed = true;
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      teardown();
    };
  }, []);

  const interactive = typeof onActivate === "function";

  return (
    <span
      ref={hostRef}
      className={[
        "here-orb",
        fallback ? "here-orb--fallback" : "",
        interactive ? "here-orb--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, "--orb-size": `${safeSize}px` }}
      data-state={safeState}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActivate(event);
              }
            }
          : undefined
      }
    >
      {fallback && (
        <img
          className="here-orb__fallback"
          src={FALLBACK_IMAGE}
          alt=""
          draggable="false"
        />
      )}
    </span>
  );
}
