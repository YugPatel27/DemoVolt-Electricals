import { Router } from "express";
import { db } from "../db.js";
import { validateCartItemPayload, validateQuantity } from "../validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireCsrfHeader } from "../middleware/csrf.js";
import { logActivity } from "../auth.js";

const router = Router();

// Every route in this file requires a logged-in user.
router.use(requireAuth);

function serializeItem(row) {
  return {
    id: row.id,
    slug: row.product_slug,
    title: row.product_title,
    brand: row.product_brand,
    quantity: row.quantity,
  };
}

function getCartForUser(userId) {
  return db
    .prepare(
      `SELECT id, product_slug, product_title, product_brand, quantity
       FROM cart_items WHERE user_id = ? ORDER BY created_at ASC`,
    )
    .all(userId)
    .map(serializeItem);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    return res.json({ success: true, items: getCartForUser(req.user.id) });
  }),
);

// Adds a product, or increments quantity if it's already in the cart.
router.post(
  "/",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const result = validateCartItemPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    const { slug, title, brand, quantity } = result.data;

    const existing = db
      .prepare(
        `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_slug = ?`,
      )
      .get(req.user.id, slug);

    if (existing) {
      const newQuantity = Math.min(999, existing.quantity + quantity);
      db.prepare(
        `UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?`,
      ).run(newQuantity, existing.id);
    } else {
      db.prepare(
        `INSERT INTO cart_items (user_id, product_slug, product_title, product_brand, quantity)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(req.user.id, slug, title, brand, quantity);
    }

    logActivity(req.user.id, "cart_add", { ip: req.ip, detail: slug });

    return res.status(201).json({ success: true, items: getCartForUser(req.user.id) });
  }),
);

router.patch(
  "/:itemId",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(itemId)) {
      return res.status(400).json({ success: false, errors: ["Invalid item id."] });
    }
    if (!validateQuantity(req.body?.quantity)) {
      return res.status(400).json({
        success: false,
        errors: ["Quantity must be a whole number between 1 and 999."],
      });
    }

    // Ownership check: the row must belong to the requesting user, or we
    // treat it as not found rather than leaking whether the id exists.
    const owned = db
      .prepare(`SELECT id FROM cart_items WHERE id = ? AND user_id = ?`)
      .get(itemId, req.user.id);
    if (!owned) {
      return res.status(404).json({ success: false, errors: ["Item not found."] });
    }

    db.prepare(
      `UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(Number(req.body.quantity), itemId);

    return res.json({ success: true, items: getCartForUser(req.user.id) });
  }),
);

router.delete(
  "/:itemId",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(itemId)) {
      return res.status(400).json({ success: false, errors: ["Invalid item id."] });
    }

    db.prepare(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`).run(
      itemId,
      req.user.id,
    );

    return res.json({ success: true, items: getCartForUser(req.user.id) });
  }),
);

router.delete(
  "/",
  requireCsrfHeader,
  asyncHandler(async (req, res) => {
    db.prepare(`DELETE FROM cart_items WHERE user_id = ?`).run(req.user.id);
    return res.json({ success: true, items: [] });
  }),
);

export default router;
