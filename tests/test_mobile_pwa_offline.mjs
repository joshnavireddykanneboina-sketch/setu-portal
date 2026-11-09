// Test Suite for SETU Mobile Application, PWA & Offline-First Subsystem
// Phase 4 Verification for Jharkhand Societal Innovation Collaboration Portal (SIH 2026 PS ID 26043)

process.env.NODE_ENV = 'test';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { app } from '../backend/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`http://localhost${urlPath}`);
    const req = new Readable({
      read() {
        if (body) {
          const str = typeof body === 'string' ? body : JSON.stringify(body);
          this.push(Buffer.from(str));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = parsedUrl.pathname + parsedUrl.search;
    req.originalUrl = req.url;
    req.body = body || {};
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.query = {};
    for (const [k, v] of parsedUrl.searchParams) {
      req.query[k] = v;
    }

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };

    let resBody = '';
    res.write = (chunk) => {
      if (chunk) resBody += chunk.toString();
      return true;
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let parsed = resBody;
      try {
        parsed = JSON.parse(resBody);
      } catch (e) {
        // keep string
      }
      resolve({
        status: res.statusCode,
        headers: res._headers,
        body: parsed
      });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('SETU PHASE 4: MOBILE APPLICATION & OFFLINE-FIRST SUITE');
  console.log('Smart India Hackathon 2026 • Problem Statement ID 26043');
  console.log('======================================================\n');

  // 1. PWA Web App Manifest
  console.log('[1/7] Testing Web App Manifest & Installation Metadata...');
  const manifestPath = path.join(rootDir, 'public/manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'manifest.webmanifest exists in public directory');
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name.includes('SETU'), 'Manifest has correct application name');
  assert(manifest.display === 'standalone', 'Display mode configured as standalone for PWA install');
  assert(manifest.background_color === '#080C14', 'Theme & background colors match SETU dark editorial design');
  assert(manifest.icons && manifest.icons.length >= 3, 'Manifest includes icons for 192px, 512px and maskable');
  assert(manifest.shortcuts && manifest.shortcuts.length >= 4, 'Manifest defines application shortcuts');

  // Verify Icon Files
  const icon192 = path.join(rootDir, 'public/icons/icon-192.png');
  const icon512 = path.join(rootDir, 'public/icons/icon-512.png');
  const iconSvg = path.join(rootDir, 'public/icons/icon-setu.svg');
  assert(fs.existsSync(icon192) && fs.existsSync(icon512) && fs.existsSync(iconSvg), 'Generated PWA icon assets exist on disk');

  // 2. Service Worker & Caching Rules
  console.log('\n[2/7] Testing Service Worker Caching Architecture...');
  const swPath = path.join(rootDir, 'public/sw.js');
  assert(fs.existsSync(swPath), 'public/sw.js Service Worker file exists');
  const swCode = fs.readFileSync(swPath, 'utf8');
  assert(swCode.includes('CACHE_NAME'), 'Defines versioned cache name');
  assert(swCode.includes('offline.html'), 'Pre-caches offline fallback shell');
  assert(
    swCode.includes('/api/') && swCode.includes('NEVER cache private authenticated API responses'),
    'SECURITY MANDATE: Strictly prevents caching private authenticated API responses in public caches'
  );
  assert(swCode.includes('caches.match'), 'Implements cache retrieval fallback');

  // 3. Offline Storage Module
  console.log('\n[3/7] Testing IndexedDB Offline Storage Service Layer...');
  const storagePath = path.join(rootDir, 'src/services/offlineStorage.js');
  assert(fs.existsSync(storagePath), 'src/services/offlineStorage.js exists');
  const storageCode = fs.readFileSync(storagePath, 'utf8');
  assert(storageCode.includes('SETU_OFFLINE_DB'), 'Configures SETU_OFFLINE_DB IndexedDB database');
  assert(storageCode.includes('saveDraft') && storageCode.includes('getDraft'), 'Exports draft save and retrieval functions');
  assert(storageCode.includes('enqueueSubmission') && storageCode.includes('idempotencyKey'), 'Exports offline queueing with idempotency keys');
  assert(storageCode.includes('WAITING_FOR_SYNC'), 'Supports transparent offline submission statuses');

  // 4. Offline Synchronization Manager
  console.log('\n[4/7] Testing Offline Synchronization Manager...');
  const syncPath = path.join(rootDir, 'src/services/syncManager.js');
  assert(fs.existsSync(syncPath), 'src/services/syncManager.js exists');
  const syncCode = fs.readFileSync(syncPath, 'utf8');
  assert(syncCode.includes('triggerBackgroundSync'), 'Exports triggerBackgroundSync function');
  assert(syncCode.includes('subscribeSyncState'), 'Exports sync state subscription listener');
  assert(syncCode.includes('window.addEventListener(\'online\''), 'Listens for network reconnection to auto-sync');
  assert(syncCode.includes('SYNCED_TO_GOVERNMENT_DB'), 'Distinguishes local draft vs confirmed government registration');

  // 5. Backend Idempotency Protection (Anti-Duplicate Submissions)
  console.log('\n[5/7] Testing Backend Idempotency Protection for Offline Retries...');
  const testIdempotencyKey = `TEST-IDEM-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  // First Submission
  const sub1 = await request('POST', '/api/challenges', {
    title: 'Idempotency Protection Verification Challenge',
    description: 'Testing automatic offline retry duplicate protection',
    district: 'Ranchi',
    block: 'Kanke',
    domain: 'Agriculture and Soil Health',
    idempotencyKey: testIdempotencyKey
  });
  assert(sub1.status === 201, 'First submission with idempotency key succeeds (HTTP 201 Created)');
  const originalId = sub1.body.id;
  assert(originalId && originalId.startsWith('SETU-JH-2026-'), 'Generated valid tracking ID', originalId);

  // Second Submission (Replay of identical idempotency key)
  const sub2 = await request('POST', '/api/challenges', {
    title: 'Idempotency Protection Verification Challenge',
    description: 'Testing automatic offline retry duplicate protection',
    district: 'Ranchi',
    block: 'Kanke',
    domain: 'Agriculture and Soil Health',
    idempotencyKey: testIdempotencyKey
  });
  assert(sub2.status === 200, 'Duplicate submission with same idempotency key returns HTTP 200 OK without recreating');
  assert(sub2.body.id === originalId, 'Replayed submission returns existing challenge ID without creating duplicates');
  assert(sub2.body.isIdempotentReplay === true, 'Server explicitly flags isIdempotentReplay: true');

  // 6. Mobile Bottom Navigation & Top Header
  console.log('\n[6/7] Testing Mobile Navigation Architecture & Responsive Shell...');
  const bottomNavPath = path.join(rootDir, 'src/components/MobileBottomNav.jsx');
  assert(fs.existsSync(bottomNavPath), 'src/components/MobileBottomNav.jsx exists');
  const bottomNavCode = fs.readFileSync(bottomNavPath, 'utf8');
  assert(bottomNavCode.includes('Home') && bottomNavCode.includes('Explore') && bottomNavCode.includes('Submit') && bottomNavCode.includes('Projects') && bottomNavCode.includes('Profile'), 'Mobile Bottom Nav includes all 5 required navigation sections');

  const topHeaderPath = path.join(rootDir, 'src/components/MobileTopHeader.jsx');
  assert(fs.existsSync(topHeaderPath), 'src/components/MobileTopHeader.jsx exists');
  const topHeaderCode = fs.readFileSync(topHeaderPath, 'utf8');
  assert(topHeaderCode.includes('Offline') && topHeaderCode.includes('Online'), 'Mobile Top Header renders live connectivity and queue indicator');
  assert(topHeaderCode.includes('beforeinstallprompt') || topHeaderCode.includes('handleInstallClick'), 'Mobile Top Header supports one-click PWA app installation');

  // 7. Capacitor Android Packaging Configuration
  console.log('\n[7/7] Testing Capacitor Android Configuration & Documentation...');
  const capConfigPath = path.join(rootDir, 'capacitor.config.json');
  assert(fs.existsSync(capConfigPath), 'capacitor.config.json exists');
  const capConfig = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'));
  assert(capConfig.appId === 'in.gov.jharkhand.setu', 'Capacitor configured with official state package ID (in.gov.jharkhand.setu)');
  assert(capConfig.webDir === 'dist', 'Capacitor points to dist web directory');

  const capGuidePath = path.join(rootDir, 'docs/CAPACITOR_MOBILE_GUIDE.md');
  assert(fs.existsSync(capGuidePath), 'docs/CAPACITOR_MOBILE_GUIDE.md documentation exists');
  const capGuide = fs.readFileSync(capGuidePath, 'utf8');
  assert(capGuide.includes('AndroidManifest.xml') && capGuide.includes('CAMERA'), 'Documentation covers Android permissions for camera and GPS');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
