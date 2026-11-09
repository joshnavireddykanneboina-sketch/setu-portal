/**
 * PostgreSQL Production Adapter for SETU Platform
 * ================================================
 * Drop-in replacement for database/db.js when a PostgreSQL connection is
 * available (NODE_ENV=production or SETU_DB_ADAPTER=postgres).
 *
 * The public API is identical to db.js so no route-controller changes are
 * needed:  initDb · getDb · find · findOne · insert · update · remove
 *
 * Schema is kept in database/schema/schema.json.  Tables are created
 * automatically on first run (initDb) if they do not already exist.
 *
 * Environment variables required:
 *   DATABASE_URL     — Full Postgres connection string
 *                      e.g. postgres://user:pass@host:5432/setu_prod
 *   (Optional) SETU_DB_POOL_MAX  — Max pool connections (default: 10)
 *   (Optional) SETU_DB_POOL_IDLE — Idle timeout ms          (default: 30000)
 *
 * Install:
 *   npm install pg
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const SEED_FILE = path.resolve(__dirname, '../seed/initialSeedData.json');

// ─── Connection pool ──────────────────────────────────────────────────────────
let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        '[POSTGRES ADAPTER] DATABASE_URL environment variable is required. ' +
        'Set it to a valid Postgres connection string or switch to the JSON adapter.'
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max:     parseInt(process.env.SETU_DB_POOL_MAX  || '10', 10),
      idleTimeoutMillis: parseInt(process.env.SETU_DB_POOL_IDLE || '30000', 10),
      connectionTimeoutMillis: 5000,
      ssl: process.env.DATABASE_URL.includes('sslmode=require')
           || process.env.DATABASE_URL.includes('ssl=true')
        ? { rejectUnauthorized: false }
        : false
    });

    pool.on('error', (err) => {
      console.error('[POSTGRES ADAPTER] Unexpected pool error:', err.message);
    });
  }
  return pool;
}

// ─── Schema bootstrap ─────────────────────────────────────────────────────────
const DDL = `
-- SETU Platform — PostgreSQL Schema (auto-created by postgresAdapter.js)
-- Mirrors the JSON store collections: users, challenges, universities, industries, districts

CREATE TABLE IF NOT EXISTS setu_users (
    id              TEXT PRIMARY KEY,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setu_challenges (
    id              TEXT PRIMARY KEY,
    district        TEXT,
    domain          TEXT,
    status          TEXT,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challenges_district ON setu_challenges(district);
CREATE INDEX IF NOT EXISTS idx_challenges_domain   ON setu_challenges(domain);
CREATE INDEX IF NOT EXISTS idx_challenges_status   ON setu_challenges(status);

CREATE TABLE IF NOT EXISTS setu_universities (
    id              TEXT PRIMARY KEY,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setu_industries (
    id              TEXT PRIMARY KEY,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setu_districts (
    id              TEXT PRIMARY KEY,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Map logical collection names → Postgres table names
const TABLE_MAP = {
  users:        'setu_users',
  challenges:   'setu_challenges',
  universities: 'setu_universities',
  industries:   'setu_industries',
  districts:    'setu_districts'
};

function tableFor(collection) {
  const tbl = TABLE_MAP[collection];
  if (!tbl) throw new Error(`[POSTGRES ADAPTER] Unknown collection: "${collection}"`);
  return tbl;
}

// ─── Seed helper ──────────────────────────────────────────────────────────────
async function seedIfEmpty(client) {
  if (!fs.existsSync(SEED_FILE)) return;

  let seed;
  try {
    seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  } catch {
    console.warn('[POSTGRES ADAPTER] Could not read seed file — skipping seed.');
    return;
  }

  for (const [collection, rows] of Object.entries(seed)) {
    if (!TABLE_MAP[collection] || !Array.isArray(rows) || rows.length === 0) continue;
    const tbl = tableFor(collection);
    const { rows: existing } = await client.query(`SELECT id FROM ${tbl} LIMIT 1`);
    if (existing.length > 0) continue; // Already seeded

    console.log(`[POSTGRES ADAPTER] Seeding ${rows.length} rows into ${tbl}…`);
    for (const row of rows) {
      const id = row.id || row.trackingId;
      if (!id) continue;
      try {
        if (collection === 'challenges') {
          await client.query(
            `INSERT INTO ${tbl} (id, district, domain, status, data)
             VALUES ($1, $2, $3, $4, $5::jsonb)
             ON CONFLICT (id) DO NOTHING`,
            [id, row.district || null, row.domain || null, row.status || null, JSON.stringify(row)]
          );
        } else {
          await client.query(
            `INSERT INTO ${tbl} (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING`,
            [id, JSON.stringify(row)]
          );
        }
      } catch (err) {
        console.warn(`[POSTGRES ADAPTER] Seed insert failed for id=${id}:`, err.message);
      }
    }
  }
}

// ─── Public API (matches db.js) ───────────────────────────────────────────────

export async function initDb() {
  const client = await getPool().connect();
  try {
    await client.query(DDL);
    await seedIfEmpty(client);
    console.log('[POSTGRES ADAPTER] Schema ready. SETU PostgreSQL database initialised.');
  } finally {
    client.release();
  }
}

/**
 * Returns all documents in a collection as a plain JS array.
 * Supports optional filter (function | object).
 */
export async function find(collection, queryFn = null) {
  const tbl = tableFor(collection);
  const { rows } = await getPool().query(`SELECT data FROM ${tbl} ORDER BY created_at DESC`);
  let items = rows.map(r => r.data);

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
  const tbl = tableFor(collection);

  // Fast path: look up by primary key
  if (typeof queryFn === 'string') {
    const { rows } = await getPool().query(
      `SELECT data FROM ${tbl} WHERE id = $1 LIMIT 1`,
      [queryFn]
    );
    return rows.length ? rows[0].data : null;
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
  const tbl = tableFor(collection);
  const id  = item.id || item.trackingId;
  if (!id) throw new Error('[POSTGRES ADAPTER] insert: document must have an id field');

  if (collection === 'challenges') {
    await getPool().query(
      `INSERT INTO ${tbl} (id, district, domain, status, data)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [id, item.district || null, item.domain || null, item.status || null, JSON.stringify(item)]
    );
  } else {
    await getPool().query(
      `INSERT INTO ${tbl} (id, data) VALUES ($1, $2::jsonb)`,
      [id, JSON.stringify(item)]
    );
  }
  return item;
}

/**
 * Merges `updates` into the document with the given `id`.
 */
export async function update(collection, id, updates) {
  const tbl      = tableFor(collection);
  const existing = await findOne(collection, id);
  if (!existing) return null;

  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };

  if (collection === 'challenges') {
    await getPool().query(
      `UPDATE ${tbl}
          SET data = $1::jsonb,
              district   = $2,
              domain     = $3,
              status     = $4,
              updated_at = NOW()
        WHERE id = $5`,
      [
        JSON.stringify(merged),
        merged.district || null,
        merged.domain   || null,
        merged.status   || null,
        id
      ]
    );
  } else {
    await getPool().query(
      `UPDATE ${tbl} SET data = $1::jsonb, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(merged), id]
    );
  }
  return merged;
}

/**
 * Removes a document by id.
 */
export async function remove(collection, id) {
  const tbl = tableFor(collection);
  await getPool().query(`DELETE FROM ${tbl} WHERE id = $1`, [id]);
  return true;
}

/** Alias used by legacy route imports */
export const getDb = () => getPool();
