import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Node's built-in SQLite module (stable, no native compilation required).
// It's marked experimental by Node itself but the API surface we use here
// (prepare/run/get/all) has been stable across recent Node versions.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints (off by default in SQLite).
db.exec("PRAGMA foreign_keys = ON;");

// WAL mode lets reads proceed without blocking on writes, which matters
// once cart/session writes happen concurrently with page-load reads.
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Lightweight migration guard: adds the lockout columns to a users table
// that was created before this feature existed, without needing a full
// migration runner. SQLite errors on a duplicate column, which we treat
// as "already migrated" and ignore.
for (const ddl of [
  `ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN locked_until INTEGER`,
  `ALTER TABLE users ADD COLUMN terms_accepted_at TEXT`,
  `ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'`,
  `ALTER TABLE users ADD COLUMN age INTEGER`,
  `ALTER TABLE users ADD COLUMN phone TEXT`,
]) {
  try {
    db.exec(ddl);
  } catch {
    // Column already exists — fine.
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

for (const ddl of [
  `ALTER TABLE sessions ADD COLUMN ip_address TEXT`,
  `ALTER TABLE sessions ADD COLUMN user_agent TEXT`,
]) {
  try {
    db.exec(ddl);
  } catch {
    // Column already exists — fine.
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_brand TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_slug)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Contact/quote form submissions. Previously these were only
// console.logged and discarded — that meant real enquiries had no
// durable record, and PII (name, email, phone, GSTIN) was landing in
// server logs instead of an access-controlled table. This table is the
// actual home for that data now, with consent captured at submission
// time per the Privacy Policy checkbox on each form.
db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    name TEXT,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    gstin TEXT,
    message TEXT,
    consent_given INTEGER NOT NULL DEFAULT 0,
    consent_policy_version TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Lightweight audit trail: who did what, from what IP, and when. This is
// the "what does the admin see about user activity" data source — scoped
// to security- and business-relevant events (auth, cart, enquiries)
// rather than a full clickstream of every page view, which would be a
// much bigger data-minimization/privacy tradeoff (see PROJECT_REVIEW.md
// §8 Data Privacy) for very little real admin value.
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// DB-backed product catalog so the admin panel can genuinely add/edit/
// remove products, not just view a read-only static list. Seeded once
// from the existing client/src/lib/catalog.js data on first boot (see
// seedProductsIfEmpty below) — the public storefront still reads from
// the static catalog file for now; see PROJECT_REVIEW.md for the
// follow-up needed to point it at this table instead.
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    division TEXT NOT NULL,
    category TEXT,
    group_name TEXT,
    brands TEXT,
    specs TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(
  `CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);`,
);
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);`,
);

/**
 * One-time seed: if the products table is empty (fresh install), populate
 * it from the existing static catalog so the admin panel starts with the
 * real product list instead of nothing. Deliberately imports from the
 * client package — this is a one-time bootstrap read of plain data, not
 * a runtime coupling between the two apps — so the ~27 existing products
 * don't have to be hand-duplicated into a seed file that would drift out
 * of sync with catalog.js over time. Safe to remove once the storefront
 * is switched over to reading from this table instead of the static file
 * (see PROJECT_REVIEW.md for that follow-up).
 */
export async function seedProductsIfEmpty() {
  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM products`)
    .get();
  if (count > 0) return;

  let catalogModule;
  try {
    catalogModule = await import("../client/src/lib/catalog.js");
  } catch (err) {
    console.warn(
      "[DB] Couldn't load client catalog to seed products table:",
      err.message,
    );
    return;
  }

  const { ALL_PRODUCTS } = catalogModule;
  const insert = db.prepare(
    `INSERT INTO products (slug, title, division, category, group_name, brands, specs)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const p of ALL_PRODUCTS) {
    insert.run(
      p.slug,
      p.title,
      p.division,
      p.category ?? null,
      p.group ?? null,
      JSON.stringify(p.brands ?? []),
      p.specs ?? null,
    );
  }
  console.log(`[DB] Seeded ${ALL_PRODUCTS.length} products from catalog.js`);
}
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);`,
);
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);`,
);
db.exec(
  `CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);`,
);
