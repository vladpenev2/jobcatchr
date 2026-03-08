const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "cache.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    linkedin_url TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS companies (
    linkedin_url TEXT PRIMARY KEY,
    numeric_id TEXT,
    name TEXT,
    slug TEXT,
    data TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  );
`);

const CACHE_TTL_DAYS = 30;

function getCachedProfile(linkedinUrl) {
  const normalized = normalizeLinkedinUrl(linkedinUrl);
  const row = db.prepare(
    "SELECT data, created_at FROM profiles WHERE linkedin_url = ? AND created_at > unixepoch() - ?"
  ).get(normalized, CACHE_TTL_DAYS * 86400);
  return row ? JSON.parse(row.data) : null;
}

function cacheProfile(linkedinUrl, data) {
  const normalized = normalizeLinkedinUrl(linkedinUrl);
  db.prepare(
    "INSERT OR REPLACE INTO profiles (linkedin_url, data) VALUES (?, ?)"
  ).run(normalized, JSON.stringify(data));
}

function getCachedCompany(linkedinUrl) {
  const normalized = normalizeLinkedinUrl(linkedinUrl);
  const row = db.prepare(
    "SELECT numeric_id, name, slug, data, created_at FROM companies WHERE linkedin_url = ? AND created_at > unixepoch() - ?"
  ).get(normalized, CACHE_TTL_DAYS * 86400);
  if (!row) return null;
  return { numericId: row.numeric_id, name: row.name, slug: row.slug, ...JSON.parse(row.data) };
}

function cacheCompany(linkedinUrl, { numericId, name, slug, ...rest }) {
  const normalized = normalizeLinkedinUrl(linkedinUrl);
  db.prepare(
    "INSERT OR REPLACE INTO companies (linkedin_url, numeric_id, name, slug, data) VALUES (?, ?, ?, ?, ?)"
  ).run(normalized, numericId || null, name || null, slug || null, JSON.stringify(rest));
}

function normalizeLinkedinUrl(url) {
  // Strip trailing slashes, query params, fragments
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/+$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

module.exports = { getCachedProfile, cacheProfile, getCachedCompany, cacheCompany };
