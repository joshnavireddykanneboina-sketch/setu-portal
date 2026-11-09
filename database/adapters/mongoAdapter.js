/**
 * MongoDB Production Adapter for SETU Platform
 * =============================================
 * Drop-in replacement for database/db.js when a MongoDB connection is
 * available (NODE_ENV=production or SETU_DB_ADAPTER=mongo).
 *
 * The public API is identical to db.js so no route-controller changes are
 * needed:  initDb · getDb · find · findOne · insert · update · remove
 *
 * Collections mirror the JSON store: users, challenges, universities,
 * industries, districts.
 *
 * Environment variables required:
 *   MONGODB_URI      — MongoDB connection string
 *                      e.g. mongodb+srv://user:pass@cluster.mongodb.net/setu
 *   (Optional) SETU_MONGO_DB_NAME — Database name (default: setu_production)
 *
 * Install:
 *   npm install mongodb
 */

import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const SEED_FILE = path.resolve(__dirname, '../seed/initialSeedData.json');
const DB_NAME   = process.env.SETU_MONGO_DB_NAME || 'setu_production';

// ─── Connection singleton ─────────────────────────────────────────────────────
let client = null;
let db     = null;

async function getDb() {
  if (!db) {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        '[MONGO ADAPTER] MONGODB_URI environment variable is required. ' +
        'Set it to a valid MongoDB connection string or switch to the JSON adapter.'
      );
    }
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize:        parseInt(process.env.SETU_MONGO_POOL_MAX || '10', 10),
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS:   10000
    });
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

// ─── Index bootstrap ──────────────────────────────────────────────────────────
async function createIndexes(database) {
  await database.collection('challenges').createIndex({ district: 1 });
  await database.collection('challenges').createIndex({ domain: 1 });
  await database.collection('challenges').createIndex({ status: 1 });
  await database.collection('challenges').createIndex({ id: 1 }, { unique: true });
  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database.collection('users').createIndex({ id: 1 }, { unique: true });
}

// ─── Seed helper ──────────────────────────────────────────────────────────────
async function seedIfEmpty(database) {
  if (!fs.existsSync(SEED_FILE)) return;

  let seed;
  try {
    seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  } catch {
    console.warn('[MONGO ADAPTER] Could not read seed file — skipping seed.');
    return;
  }

  for (const [collection, rows] of Object.entries(seed)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const col   = database.collection(collection);
    const count = await col.countDocuments();
    if (count > 0) continue; // Already seeded

    console.log(`[MONGO ADAPTER] Seeding ${rows.length} documents into ${collection}…`);
    const docs = rows.map(r => ({ ...r, _setu_id: r.id || r.trackingId }));
    await col.insertMany(docs, { ordered: false }).catch(err => {
      console.warn(`[MONGO ADAPTER] Partial seed failure for ${collection}:`, err.message);
    });
  }
}

// ─── Public API (matches db.js) ───────────────────────────────────────────────

export async function initDb() {
  const database = await getDb();
  await createIndexes(database);
  await seedIfEmpty(database);
  console.log('[MONGO ADAPTER] Indexes and seed verified. SETU MongoDB database initialised.');
  return database;
}

/**
 * Returns all documents in a collection as a plain JS array.
 * Supports optional filter (function | object).
 */
export async function find(collection, queryFn = null) {
  const database = await getDb();
  const docs     = await database.collection(collection).find({}).toArray();
  // Strip internal Mongo fields so downstream code sees clean SETU objects
  const items    = docs.map(({ _id, _setu_id, ...rest }) => rest);

  if (typeof queryFn === 'function') return items.filter(queryFn);
  if (queryFn && typeof queryFn === 'object') {
    return items.filter(item =>
      Object.keys(queryFn).every(k => item[k] === queryFn[k])
    );
  }
  return items;
}

/**
 * Returns a single document matched by id string, { key: value } object, or
 * a predicate function.
 */
export async function findOne(collection, queryFn) {
  const database = await getDb();

  if (typeof queryFn === 'string') {
    const doc = await database.collection(collection).findOne({ id: queryFn });
    if (!doc) return null;
    const { _id, _setu_id, ...rest } = doc;
    return rest;
  }

  const all = await find(collection);
  if (typeof queryFn === 'function') return all.find(queryFn) || null;
  if (typeof queryFn === 'object') {
    return all.find(item => Object.keys(queryFn).every(k => item[k] === queryFn[k])) || null;
  }
  return null;
}

/**
 * Inserts a new document.  The document MUST have an `id` field.
 */
export async function insert(collection, item) {
  const database = await getDb();
  const id       = item.id || item.trackingId;
  if (!id) throw new Error('[MONGO ADAPTER] insert: document must have an id field');

  await database.collection(collection).insertOne({ ...item, _setu_id: id });
  return item;
}

/**
 * Merges `updates` into the document with the given `id`.
 */
export async function update(collection, id, updates) {
  const database = await getDb();
  const merged   = { ...updates, updatedAt: new Date().toISOString() };

  const result = await database.collection(collection).findOneAndUpdate(
    { id },
    { $set: merged },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const { _id, _setu_id, ...rest } = result;
  return rest;
}

/**
 * Removes a document by id.
 */
export async function remove(collection, id) {
  const database = await getDb();
  await database.collection(collection).deleteOne({ id });
  return true;
}

/** Alias for callers that import getDb directly */
export { getDb };
