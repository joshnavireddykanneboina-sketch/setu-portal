// Builds the Vite app against the deployed API and copies it into android/.
// Refuses localhost, loopback, and private-network API addresses.

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`\n[android:sync] ${message}\n`);
  process.exit(1);
}

function assertPublicApi(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail('VITE_API_BASE_URL must be an absolute http(s) URL of the deployed SETU server.');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    fail('VITE_API_BASE_URL must start with https:// or http://.');
  }
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1' || host.endsWith('.local');
  const privateNet = /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  if (local || privateNet) {
    fail(`Refusing to package the Android app against ${url.origin}. Use the deployed public API, not localhost or a private LAN address.`);
  }
  return url;
}

const envFile = dotenv.config({ path: path.join(rootDir, '.env.android') });
const apiRaw = (process.env.VITE_API_BASE_URL || envFile.parsed?.VITE_API_BASE_URL || '').trim();
if (!apiRaw) {
  fail('Missing VITE_API_BASE_URL. Copy .env.android.example to .env.android and set the deployed server URL.');
}
const apiUrl = assertPublicApi(apiRaw);

if (!fs.existsSync(path.join(rootDir, 'android'))) {
  fail('The android/ project does not exist yet. Run: npx cap add android');
}

console.log(`[android:sync] Packaging web assets for ${apiUrl.origin}`);

const build = spawnSync('npx', ['vite', 'build'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_API_BASE_URL: apiRaw.replace(/\/$/, '')
  }
});
if (build.status !== 0) fail('Vite build failed.');

const marker = `SETU_API_TARGET:${apiRaw.replace(/\/$/, '')}`;
const assetsDir = path.join(rootDir, 'dist', 'assets');
const bundles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js')) : [];
const markerFound = bundles.some((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8').includes(marker));
if (!markerFound) {
  fail('The production bundle does not contain the deployed API marker. The Android app was not packaged.');
}

const sync = spawnSync('npx', ['cap', 'sync', 'android'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});
if (sync.status !== 0) fail('cap sync android failed.');

applyNativeProject(apiUrl);

const androidAssets = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'assets');
const androidJs = fs.existsSync(androidAssets) ? fs.readdirSync(androidAssets).filter((name) => name.endsWith('.js')) : [];
const androidMarker = androidJs.some((name) => fs.readFileSync(path.join(androidAssets, name), 'utf8').includes(marker));
const androidLocalhost = androidJs.some((name) => /SETU_API_TARGET:https?:\/\/(localhost|127\.0\.0\.1)/i.test(fs.readFileSync(path.join(androidAssets, name), 'utf8')));
if (!androidMarker || androidLocalhost) {
  fail('Android assets are not pointed at the deployed API.');
}

console.log(`[android:sync] Android project is ready. API origin: ${apiUrl.origin}`);

function applyNativeProject(url) {
  const androidMain = path.join(rootDir, 'android', 'app', 'src', 'main');
  const manifestPath = path.join(androidMain, 'AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) fail('AndroidManifest.xml was not generated.');

  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const permissions = [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.CAMERA',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.READ_MEDIA_IMAGES'
  ];
  for (const permission of permissions) {
    const tag = `<uses-permission android:name="${permission}" />`;
    if (!manifest.includes(permission)) {
      manifest = manifest.replace('<application', `${tag}\n    <application`);
    }
  }
  if (!manifest.includes('android.hardware.camera')) {
    manifest = manifest.replace(
      '<application',
      '<uses-feature android:name="android.hardware.camera" android:required="false" />\n    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />\n    <application'
    );
  }
  if (!manifest.includes('android:maxSdkVersion="32"') && !manifest.includes('READ_EXTERNAL_STORAGE')) {
    manifest = manifest.replace(
      '<application',
      '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />\n    <application'
    );
  }

  const useCleartext = url.protocol === 'http:';
  const resXml = path.join(androidMain, 'res', 'xml');
  fs.mkdirSync(resXml, { recursive: true });
  const domainConfig = useCleartext
    ? `<domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">${url.hostname}</domain>
    </domain-config>`
    : `<domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">${url.hostname}</domain>
    </domain-config>`;
  fs.writeFileSync(
    path.join(resXml, 'network_security_config.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    ${domainConfig}
</network-security-config>
`
  );

  if (!manifest.includes('networkSecurityConfig')) {
    manifest = manifest.replace('<application', '<application android:networkSecurityConfig="@xml/network_security_config"');
  }
  manifest = manifest.replace(/android:usesCleartextTraffic="(?:true|false)"/, '');
  manifest = manifest.replace(
    '<application',
    `<application android:usesCleartextTraffic="${useCleartext ? 'true' : 'false'}"`
  );
  fs.writeFileSync(manifestPath, manifest);

  copyBranding(androidMain);
}

function copyBranding(androidMain) {
  const icon = path.join(rootDir, 'public', 'icons', 'icon-512.png');
  if (!fs.existsSync(icon)) return;
  const densities = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
  for (const density of densities) {
    const dir = path.join(androidMain, 'res', density);
    fs.mkdirSync(dir, { recursive: true });
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
      fs.copyFileSync(icon, path.join(dir, name));
    }
  }
  const drawable = path.join(androidMain, 'res', 'drawable');
  fs.mkdirSync(drawable, { recursive: true });
  fs.copyFileSync(icon, path.join(drawable, 'splash.png'));

  const values = path.join(androidMain, 'res', 'values');
  fs.mkdirSync(values, { recursive: true });
  const colorsPath = path.join(values, 'colors.xml');
  if (!fs.existsSync(colorsPath)) {
    fs.writeFileSync(
      colorsPath,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#080C14</color>
</resources>
`
    );
  } else if (!fs.readFileSync(colorsPath, 'utf8').includes('splash_background')) {
    const colors = fs.readFileSync(colorsPath, 'utf8').replace(
      '</resources>',
      '    <color name="splash_background">#080C14</color>\n</resources>'
    );
    fs.writeFileSync(colorsPath, colors);
  }

  const stringsPath = path.join(values, 'strings.xml');
  if (fs.existsSync(stringsPath)) {
    let strings = fs.readFileSync(stringsPath, 'utf8');
    strings = strings.replace(/<string name="app_name">[\s\S]*?<\/string>/, '<string name="app_name">SETU Jharkhand</string>');
    strings = strings.replace(/<string name="title_activity_main">[\s\S]*?<\/string>/, '<string name="title_activity_main">SETU Jharkhand</string>');
    const disclosure = 'SETU uses the camera for challenge photos, location to tag a district problem, and network access to reach the deployed SETU server. Drafts stay on this device.';
    if (!strings.includes('setu_privacy_disclosure')) {
      strings = strings.replace(
        '</resources>',
        `    <string name="setu_privacy_disclosure">${disclosure}</string>\n    <string name="package_name">in.gov.jharkhand.setu</string>\n</resources>`
      );
    }
    fs.writeFileSync(stringsPath, strings);
  }
}
