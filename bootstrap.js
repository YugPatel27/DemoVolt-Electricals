import { db } from "./db.js";
import { hashPassword } from "./auth.js";

/**
 * Creates the first admin account from ADMIN_EMAIL / ADMIN_BOOTSTRAP_PASSWORD
 * env vars, but only if no admin account exists yet. This is deliberately
 * the *only* way to create an admin — there is no API endpoint that lets
 * anyone self-promote to admin, which would be a privilege-escalation hole.
 * Once at least one admin exists, further admins/staff are created by an
 * existing admin promoting an existing user's role from the admin panel.
 */
export async function bootstrapAdminAccount() {
  const existingAdmin = db
    .prepare(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`)
    .get();
  if (existingAdmin) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.log(
      "[Bootstrap] No admin account exists yet. Set ADMIN_EMAIL and " +
        "ADMIN_BOOTSTRAP_PASSWORD in .env and restart to create one.",
    );
    return;
  }

  const existingUser = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(email.toLowerCase());

  if (existingUser) {
    db.prepare(`UPDATE users SET role = 'admin' WHERE id = ?`).run(
      existingUser.id,
    );
    console.log(`[Bootstrap] Promoted existing account ${email} to admin.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  db.prepare(
    `INSERT INTO users (name, email, password_hash, role, terms_accepted_at)
     VALUES (?, ?, ?, 'admin', datetime('now'))`,
  ).run("Admin", email.toLowerCase(), passwordHash);
  console.log(`[Bootstrap] Created admin account for ${email}.`);
}
