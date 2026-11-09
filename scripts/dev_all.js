// SETU Development Runner: Launches Express Backend & Vite Frontend concurrently
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🏛️  STARTING SETU - JHARKHAND SOCIETAL COLLABORATION PORTAL');
console.log('   Smart India Hackathon 2026 • Problem Statement ID: 26043');
console.log('================================================================');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const nodeCmd = isWindows ? 'node.exe' : 'node';

// Launch Backend API Server (Port 5000)
console.log('\n[1/2] 🚀 Launching Backend API Server (Port 5000)...');
const backend = spawn(nodeCmd, ['backend/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
  env: { ...process.env, PORT: '5000' }
});

// Launch Vite Frontend (Port 5173)
console.log('\n[2/2] 🌐 Launching Vite Frontend Dev Server (Port 5173)...');
const frontend = spawn(npxCmd, ['vite'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows
});

function cleanup(exitCode = 0) {
  console.log('\n🛑 Shutting down SETU services...');
  try {
    if (backend && !backend.killed) {
      if (isWindows) {
        spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      } else {
        backend.kill('SIGTERM');
      }
    }
  } catch (e) {}

  try {
    if (frontend && !frontend.killed) {
      if (isWindows) {
        spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
      } else {
        frontend.kill('SIGTERM');
      }
    }
  } catch (e) {}

  process.exit(exitCode);
}

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
process.on('exit', () => cleanup(0));

backend.on('error', (err) => {
  console.error('❌ Backend failed to start:', err.message);
  cleanup(1);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend failed to start:', err.message);
  cleanup(1);
});
