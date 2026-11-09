// Persistent File-backed JSON Database Engine for SETU Platform
// Jharkhand Societal Innovation Collaboration Portal
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'setu_db.json');
const SEED_FILE = path.join(__dirname, 'seed', 'initialSeedData.json');

let cachedData = null;

export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      console.log('[DATABASE] Initializing fresh SETU database from seed data...');
      const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
      fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
      cachedData = JSON.parse(seedContent);
    } else {
      cachedData = {
        users: [],
        universities: [],
        industries: [],
        challenges: [],
        districts: [],
        analyticsSummary: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(cachedData, null, 2), 'utf-8');
    }
  } else {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      cachedData = JSON.parse(content);
    } catch (e) {
      console.error('[DATABASE] Error reading database file, reinitializing from seed:', e);
      const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
      cachedData = JSON.parse(seedContent);
      fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
    }
  }

  return cachedData;
}

export function getDb() {
  if (!cachedData) {
    return initDb();
  }
  return cachedData;
}

export function saveDb(data) {
  cachedData = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DATABASE] Error saving database file:', e);
  }
}

export function getCollection(collectionName) {
  const db = getDb();
  if (!db[collectionName]) {
    db[collectionName] = [];
  }
  return db[collectionName];
}

export function findOne(collectionName, queryFn) {
  const col = getCollection(collectionName);
  if (typeof queryFn === 'function') {
    return col.find(queryFn) || null;
  }
  if (typeof queryFn === 'object') {
    return col.find(item => Object.keys(queryFn).every(k => item[k] === queryFn[k])) || null;
  }
  return col.find(item => item.id === queryFn) || null;
}

export function find(collectionName, queryFn = null) {
  const col = getCollection(collectionName);
  if (!queryFn) return col;
  if (typeof queryFn === 'function') {
    return col.filter(queryFn);
  }
  if (typeof queryFn === 'object') {
    return col.filter(item => Object.keys(queryFn).every(k => item[k] === queryFn[k]));
  }
  return col;
}

export function insert(collectionName, item) {
  const db = getDb();
  if (!db[collectionName]) db[collectionName] = [];
  db[collectionName].unshift(item);
  saveDb(db);
  return item;
}

export function update(collectionName, id, updates) {
  const db = getDb();
  const col = db[collectionName] || [];
  const idx = col.findIndex(i => i.id === id);
  if (idx !== -1) {
    col[idx] = { ...col[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDb(db);
    return col[idx];
  }
  return null;
}

export function remove(collectionName, id) {
  const db = getDb();
  const col = db[collectionName] || [];
  const filtered = col.filter(i => i.id !== id);
  db[collectionName] = filtered;
  saveDb(db);
  return true;
}
