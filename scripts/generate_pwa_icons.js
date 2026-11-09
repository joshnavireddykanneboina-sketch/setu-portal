// Generates valid PNG and SVG icons for SETU PWA
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080C14" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE" />
      <stop offset="100%" stop-color="#4FACFE" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#00F2FE" stroke-width="6" stroke-opacity="0.3" />

  <!-- Outer Geometric Ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="url(#cyanGrad)" stroke-width="8" stroke-dasharray="8 12" opacity="0.4" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="#00F2FE" stroke-width="12" opacity="0.8" filter="url(#glow)" />

  <!-- SETU Bridge Arch Innovation Icon -->
  <path d="M150 330 C190 200, 322 200, 362 330" fill="none" stroke="url(#cyanGrad)" stroke-width="26" stroke-linecap="round" />
  <path d="M185 330 C215 240, 297 240, 327 330" fill="none" stroke="#EBA756" stroke-width="14" stroke-linecap="round" opacity="0.9" />

  <!-- Central Vertical Suspension Cable / Stupa Spire -->
  <line x1="256" y1="130" x2="256" y2="280" stroke="#00F2FE" stroke-width="12" stroke-linecap="round" />
  <circle cx="256" cy="130" r="18" fill="#00F2FE" filter="url(#glow)" />

  <!-- Diagonal Suspension Rays -->
  <line x1="210" y1="230" x2="210" y2="330" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" opacity="0.7" />
  <line x1="302" y1="230" x2="302" y2="330" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" opacity="0.7" />

  <!-- Water Flow Waves Below Bridge -->
  <path d="M140 375 Q 198 360, 256 375 T 372 375" fill="none" stroke="#00F2FE" stroke-width="8" stroke-linecap="round" opacity="0.6" />
  <path d="M160 405 Q 208 395, 256 405 T 352 405" fill="none" stroke="#8DCFA9" stroke-width="6" stroke-linecap="round" opacity="0.5" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-setu.svg'), svgContent);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), svgContent);

// Function to generate raw PNG with simple uncompressed/deflated RGBA raster
function createPngBuffer(width, height) {
  // Simple PNG encoder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Generate image data (Dark slate background with cyan glowing circle and bridge)
  const rawBytes = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let rCol = 8;
      let gCol = 12;
      let bCol = 20;
      let aCol = 255;

      // Outer ring
      if (Math.abs(dist - r) < (width * 0.03)) {
        rCol = 0;
        gCol = 242;
        bCol = 254;
      }
      // Inner arch
      else if (dy > -width * 0.1 && dy < width * 0.25) {
        const archY = (width * 0.25) - ((width * 0.35) * Math.cos((dx / (width * 0.35)) * (Math.PI / 2.5)));
        if (Math.abs(dy - archY) < (width * 0.04) && Math.abs(dx) < width * 0.32) {
          rCol = 0;
          gCol = 242;
          bCol = 254;
        } else if (Math.abs(dy - (archY + width * 0.04)) < (width * 0.02) && Math.abs(dx) < width * 0.28) {
          rCol = 235;
          gCol = 167;
          bCol = 86;
        }
      }
      // Center beacon
      else if (Math.abs(dx) < width * 0.02 && dy < -width * 0.1 && dy > -width * 0.35) {
        rCol = 0;
        gCol = 242;
        bCol = 254;
      }

      rawBytes[offset++] = rCol;
      rawBytes[offset++] = gCol;
      rawBytes[offset++] = bCol;
      rawBytes[offset++] = aCol;
    }
  }

  const compressedData = zlib.deflateSync(rawBytes);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBuffer, data]);

  const crc = crc32(payload);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const CRC_TABLE = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

// Generate PNGs
const png192 = createPngBuffer(192, 192);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

const png512 = createPngBuffer(512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.png'), png512);

console.log('✓ Generated SETU PWA icons: icon-192.png, icon-512.png, icon-maskable.png, icon-setu.svg');
