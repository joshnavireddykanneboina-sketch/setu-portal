/**
 * Database Adapter Selector for SETU Platform
 * ============================================
 * Reads the SETU_DB_ADAPTER environment variable and exports the correct
 * adapter module so the rest of the application imports from one place.
 *
 * Supported values for SETU_DB_ADAPTER:
 *   json     (default) — file-backed JSON engine, zero external dependencies
 *   postgres           — PostgreSQL via `pg` npm package
 *   mongo              — MongoDB via `mongodb` npm package
 *
 * Usage in route handlers (no change required from the existing db.js imports):
 *
 *   import { find, findOne, insert, update } from '../../database/db.js';
 *
 * The file database/db.js already re-exports from this selector.
 */

const adapter = (process.env.SETU_DB_ADAPTER || 'json').toLowerCase().trim();

let dbModule;

if (adapter === 'postgres' || adapter === 'postgresql') {
  // Dynamic import so the `pg` package is only required when opted in
  dbModule = await import('./postgresAdapter.js');
  console.log('[DB SELECTOR] Using PostgreSQL production adapter.');
} else if (adapter === 'mongo' || adapter === 'mongodb') {
  // Dynamic import so the `mongodb` package is only required when opted in
  dbModule = await import('./mongoAdapter.js');
  console.log('[DB SELECTOR] Using MongoDB production adapter.');
} else {
  dbModule = await import('../db.js');
  if (adapter !== 'json') {
    console.warn(`[DB SELECTOR] Unknown SETU_DB_ADAPTER="${adapter}", falling back to JSON engine.`);
  }
}

export const { initDb, getDb, find, findOne, insert, update, remove } = dbModule;
