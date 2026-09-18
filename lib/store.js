const fs = require('node:fs');
const path = require('node:path');
const { createHmac, randomUUID } = require('node:crypto');

// One bounded pool per warm process; Neon DATABASE_URL uses its connection pooler.
// Local development uses one SQLite WAL connection instead of an unnecessary pool.
function createStore(options = {}) {
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/metrics.json'), 'utf8'));
  seed.performance = {};
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  let pool;
  let db;
  let ready;
  let lastCleanup = 0;
  const secret = databaseUrl || randomUUID();
  async function init() {
    if (databaseUrl) {
      const { Pool } = require('pg');
      const connection = new URL(databaseUrl);
      if (connection.searchParams.get('sslmode') === 'require') connection.searchParams.set('sslmode', 'verify-full');
      pool = new Pool({ connectionString: connection.toString(), max: 3, connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000, query_timeout: 10000 });
      if (process.env.VERCEL) require('@vercel/functions').attachDatabasePool(pool);
      pool.on('error', () => console.error(JSON.stringify({ event: 'database_connection_error' })));
      await pool.query('CREATE TABLE IF NOT EXISTS healthbridge_state (id INTEGER PRIMARY KEY, data JSONB NOT NULL)');
      await pool.query('CREATE TABLE IF NOT EXISTS healthbridge_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)');
      await pool.query('INSERT INTO healthbridge_state VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [seed]);
    } else {
      if (process.env.VERCEL) throw new Error('DATABASE_URL is required on Vercel');
      const { DatabaseSync } = require('node:sqlite');
      const filename = options.filename || process.env.SQLITE_PATH || path.join(__dirname, '../storage/healthbridge.sqlite');
      if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
      db = new DatabaseSync(filename);
      db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS healthbridge_state (id INTEGER PRIMARY KEY, data TEXT NOT NULL)');
      db.prepare('INSERT OR IGNORE INTO healthbridge_state VALUES (1, ?)').run(JSON.stringify(seed));
    }
  }
  function initialize() { return ready ||= init().catch(async (error) => {
    if (pool) { await pool.end(); pool = undefined; }
    if (db) { db.close(); db = undefined; }
    ready = undefined;
    throw error;
  }); }
  const localLimits = new Map();
  return {
    initialize,
    async read() {
      await initialize();
      if (pool) return (await pool.query('SELECT data FROM healthbridge_state WHERE id = 1')).rows[0].data;
      return JSON.parse(db.prepare('SELECT data FROM healthbridge_state WHERE id = 1').get().data);
    },
    async mutate(change) {
      await initialize();
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const state = (await client.query('SELECT data FROM healthbridge_state WHERE id = 1 FOR UPDATE')).rows[0].data;
          change(state);
          await client.query('UPDATE healthbridge_state SET data = $1 WHERE id = 1', [state]);
          await client.query('COMMIT');
        } catch (error) { await client.query('ROLLBACK'); throw error; }
        finally { client.release(); }
      } else {
        db.exec('BEGIN IMMEDIATE');
        try {
          const state = JSON.parse(db.prepare('SELECT data FROM healthbridge_state WHERE id = 1').get().data);
          change(state);
          db.prepare('UPDATE healthbridge_state SET data = ? WHERE id = 1').run(JSON.stringify(state));
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
    },
    async allow(ip, method, limit) {
      await initialize();
      const now = Date.now();
      const bucket = Math.floor(now / 60000);
      const expires = (bucket + 1) * 60000;
      const key = createHmac('sha256', secret).update(`${bucket}:${method}:${ip}`).digest('hex');
      if (pool) {
        if (now - lastCleanup > 60000) {
          lastCleanup = now;
          await pool.query('DELETE FROM healthbridge_limits WHERE expires < $1', [now]);
        }
        const result = await pool.query(`INSERT INTO healthbridge_limits VALUES ($1, 1, $2)
          ON CONFLICT (key) DO UPDATE SET count = healthbridge_limits.count + 1 RETURNING count`, [key, expires]);
        return result.rows[0].count <= limit;
      }
      for (const [id, entry] of localLimits) if (entry.expires <= now) localLimits.delete(id);
      if (!localLimits.has(key) && localLimits.size >= 10000) return false;
      const entry = localLimits.get(key) || { count: 0, expires };
      localLimits.set(key, entry);
      return ++entry.count <= limit;
    },
    async close() { if (pool) await pool.end(); if (db) db.close(); },
  };
}
module.exports = { createStore };
