import { Router } from "express";
import { db } from "../db.js";
import { validateContactPayload, validateQuotePayload } from "../validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { formSubmissionLimiter } from "../middleware/rateLimiter.js";
import { logActivity } from "../auth.js";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";
import adminRoutes from "./admin.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/admin", adminRoutes);

// Bump this whenever the Privacy Policy materially changes, so stored
// consent records reflect the version of the policy the person actually
// agreed to at submission time.
const PRIVACY_POLICY_VERSION = "2026-07-25";

// Health check endpoint — used by uptime monitors / load balancers.
// Deliberately unauthenticated and unrate-limited.
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "DemoVolt Electricals Prototype API",
  });
});

/**
 * Persists an enquiry to the database and returns its id. This used to
 * only console.log the raw payload (name, email, phone, GSTIN) — that
 * meant PII was landing in server/hosting logs, which are typically
 * unredacted and retained far longer, and with far less access control,
 * than the database itself. Logging now only ever includes the row id
 * and kind, never the payload.
 */
async function recordEnquiry(kind, data) {
  const result = db
    .prepare(
      `INSERT INTO enquiries
         (kind, name, company, email, phone, gstin, message, consent_given, consent_policy_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      kind,
      data.name ?? data.contactName ?? null,
      data.company ?? null,
      data.email,
      data.phone ?? null,
      data.gstin ?? null,
      data.message ?? data.requirements ?? null,
      data.consentGiven ? 1 : 0,
      PRIVACY_POLICY_VERSION,
    );

  const id = Number(result.lastInsertRowid);
  console.log(`[Enquiry] New ${kind} recorded (id=${id})`);
  return id;
}

// Contact Form Endpoint
router.post(
  "/contact",
  formSubmissionLimiter,
  asyncHandler(async (req, res) => {
    const result = validateContactPayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const id = await recordEnquiry("contact", result.data);
    logActivity(req.user?.id ?? null, "enquiry_contact", {
      ip: req.ip,
      detail: `enquiry #${id}`,
    });

    return res.json({
      success: true,
      message:
        "Thank you for reaching out to DemoVolt Electricals. This prototype has recorded your sample enquiry.",
    });
  }),
);

// Bulk Quote Enquiry Endpoint
router.post(
  "/quote",
  formSubmissionLimiter,
  asyncHandler(async (req, res) => {
    const result = validateQuotePayload(req.body);
    if (!result.isValid) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    const id = await recordEnquiry("quote", result.data);
    logActivity(req.user?.id ?? null, "enquiry_quote", {
      ip: req.ip,
      detail: `enquiry #${id}`,
    });

    return res.json({
      success: true,
      message:
        "Your bulk procurement quote request has been registered. We will send you custom pricing shortly.",
    });
  }),
);

export default router;
