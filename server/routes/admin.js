import { Router } from "express";
import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { requireCsrfHeader } from "../middleware/csrf.js";
import { validateProductPayload, validateRolePayload } from "../validation.js";

const router = Router();

// Every admin route requires a logged-in session. Read routes are open to
// both "admin" and "staff"; mutating routes are admin-only — see the
// per-route requireRole() calls below for the exact split.
router.use(requireAuth);

function paginationParams(req, defaultLimit = 50, maxLimit = 200) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number.parseInt(req.query.limit, 10) || defaultLimit),
  );
  return { page, limit, offset: (page - 1) * limit };
}

// ── Overview ────────────────────────────────────────────────────────────

router.get(
  "/overview",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const counts = {
      users: db.prepare(`SELECT COUNT(*) as n FROM users`).get().n,
      products: db.prepare(`SELECT COUNT(*) as n FROM products`).get().n,
      enquiries: db.prepare(`SELECT COUNT(*) as n FROM enquiries`).get().n,
      cartItems: db.prepare(`SELECT COUNT(*) as n FROM cart_items`).get().n,
      activeSessions: db
        .prepare(`SELECT COUNT(*) as n FROM sessions WHERE expires_at > ?`)
        .get(Date.now()).n,
    };
    const recentEnquiries = db
      .prepare(
        `SELECT id, kind, email, created_at as createdAt FROM enquiries ORDER BY created_at DESC LIMIT 5`,
      )
      .all();
    return res.json({ success: true, counts, recentEnquiries });
  }),
);

// ── Users ───────────────────────────────────────────────────────────────

router.get(
  "/users",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const { limit, offset, page } = paginationParams(req);
    const total = db.prepare(`SELECT COUNT(*) as n FROM users`).get().n;
    const users = db
      .prepare(
        `SELECT id, name, email, role, failed_attempts as failedAttempts,
                locked_until as lockedUntil, terms_accepted_at as termsAcceptedAt,
                created_at as createdAt
         FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(limit, offset);
    return res.json({ success: true, users, total, page, limit });
  }),
);

// Change a user's role. Admin-only, and deliberately refuses to demote
// the last remaining admin — otherwise a mistaken click could lock
// everyone out of the admin panel with no way back in short of a direct
// DB edit.
router.patch(
  "/users/:id/role",
  requireCsrfHeader,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ success: false, errors: ["Invalid user id."] });
    }

    const result = validateRolePayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const target = db.prepare(`SELECT role FROM users WHERE id = ?`).get(userId);
    if (!target) {
      return res.status(404).json({ success: false, errors: ["User not found."] });
    }

    if (target.role === "admin" && result.data.role !== "admin") {
      const adminCount = db
        .prepare(`SELECT COUNT(*) as n FROM users WHERE role = 'admin'`)
        .get().n;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          errors: ["Can't remove the last admin account's admin role."],
        });
      }
    }

    db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(
      result.data.role,
      userId,
    );
    return res.json({ success: true });
  }),
);

// ── Products ────────────────────────────────────────────────────────────

function serializeProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    division: row.division,
    category: row.category,
    group: row.group_name,
    brands: row.brands ? JSON.parse(row.brands) : [],
    specs: row.specs,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get(
  "/products",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(`SELECT * FROM products ORDER BY division, group_name, title`)
      .all();
    return res.json({ success: true, products: rows.map(serializeProduct) });
  }),
);

router.post(
  "/products",
  requireCsrfHeader,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const result = validateProductPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    const { slug, title, division, category, group, brands, specs } = result.data;

    const existing = db.prepare(`SELECT id FROM products WHERE slug = ?`).get(slug);
    if (existing) {
      return res.status(409).json({
        success: false,
        errors: ["A product with that slug already exists."],
      });
    }

    const insertResult = db
      .prepare(
        `INSERT INTO products (slug, title, division, category, group_name, brands, specs)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(slug, title, division, category, group, JSON.stringify(brands), specs);

    const row = db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .get(Number(insertResult.lastInsertRowid));
    return res.status(201).json({ success: true, product: serializeProduct(row) });
  }),
);

router.patch(
  "/products/:id",
  requireCsrfHeader,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, errors: ["Invalid product id."] });
    }

    const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ success: false, errors: ["Product not found."] });
    }

    const result = validateProductPayload(req.body, { partial: true });
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const merged = {
      slug: result.data.slug ?? existing.slug,
      title: result.data.title ?? existing.title,
      division: result.data.division ?? existing.division,
      category: result.data.category !== undefined ? result.data.category : existing.category,
      group: result.data.group !== undefined ? result.data.group : existing.group_name,
      brands:
        result.data.brands !== undefined
          ? JSON.stringify(result.data.brands)
          : existing.brands,
      specs: result.data.specs !== undefined ? result.data.specs : existing.specs,
      active: result.data.active !== undefined ? (result.data.active ? 1 : 0) : existing.active,
    };

    if (merged.slug !== existing.slug) {
      const clash = db
        .prepare(`SELECT id FROM products WHERE slug = ? AND id != ?`)
        .get(merged.slug, id);
      if (clash) {
        return res.status(409).json({
          success: false,
          errors: ["A product with that slug already exists."],
        });
      }
    }

    db.prepare(
      `UPDATE products SET slug = ?, title = ?, division = ?, category = ?,
         group_name = ?, brands = ?, specs = ?, active = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(
      merged.slug,
      merged.title,
      merged.division,
      merged.category,
      merged.group,
      merged.brands,
      merged.specs,
      merged.active,
      id,
    );

    const row = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    return res.json({ success: true, product: serializeProduct(row) });
  }),
);

router.delete(
  "/products/:id",
  requireCsrfHeader,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, errors: ["Invalid product id."] });
    }
    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
    return res.json({ success: true });
  }),
);

// ── Enquiries ("orders") ────────────────────────────────────────────────
// There is no checkout/payment flow in this codebase — enquiries (contact
// + bulk quote submissions) are the closest real equivalent to "orders".

router.get(
  "/enquiries",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const { limit, offset, page } = paginationParams(req);
    const kind = ["contact", "quote"].includes(req.query.kind) ? req.query.kind : null;

    const where = kind ? `WHERE kind = ?` : "";
    const params = kind ? [kind] : [];

    const total = db
      .prepare(`SELECT COUNT(*) as n FROM enquiries ${where}`)
      .get(...params).n;
    const enquiries = db
      .prepare(
        `SELECT id, kind, name, company, email, phone, gstin, message,
                consent_given as consentGiven, created_at as createdAt
         FROM enquiries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset);

    return res.json({ success: true, enquiries, total, page, limit });
  }),
);

// ── Cart activity ("add to carts") ─────────────────────────────────────

router.get(
  "/carts",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT c.id, c.product_slug as slug, c.product_title as title,
                c.product_brand as brand, c.quantity,
                c.updated_at as updatedAt,
                u.id as userId, u.name as userName, u.email as userEmail
         FROM cart_items c
         JOIN users u ON u.id = c.user_id
         ORDER BY c.updated_at DESC
         LIMIT 200`,
      )
      .all();
    return res.json({ success: true, cartItems: rows });
  }),
);

// ── Activity / audit log (includes IP) ─────────────────────────────────

router.get(
  "/activity",
  requireRole("admin", "staff"),
  asyncHandler(async (req, res) => {
    const { limit, offset, page } = paginationParams(req, 50, 200);
    const userId = Number.isInteger(Number(req.query.userId))
      ? Number(req.query.userId)
      : null;

    const where = userId ? `WHERE a.user_id = ?` : "";
    const params = userId ? [userId] : [];

    const total = db
      .prepare(`SELECT COUNT(*) as n FROM activity_log a ${where}`)
      .get(...params).n;
    const entries = db
      .prepare(
        `SELECT a.id, a.action, a.detail, a.ip_address as ip, a.created_at as createdAt,
                u.name as userName, u.email as userEmail
         FROM activity_log a
         LEFT JOIN users u ON u.id = a.user_id
         ${where}
         ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset);

    return res.json({ success: true, entries, total, page, limit });
  }),
);

export default router;
