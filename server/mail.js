import { config } from "./config.js";

/**
 * Placeholder for a real transactional email provider. Isolated here so
 * plugging in SendGrid/SES/Postmark/etc. later only touches this file.
 *
 * Deliberately does NOT log the recipient email or the reset link itself
 * in production — that would repeat the exact PII-in-logs mistake this
 * codebase already had with contact-form submissions (see
 * routes/api.js). In development, the link is logged so the flow can be
 * tested end-to-end without a real mail provider configured.
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  if (config.env !== "production") {
    console.log(`[Mail:dev] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  // No provider wired up yet — fail loudly in production rather than
  // silently pretending an email was sent.
  console.error(
    "[Mail] No email provider configured — password reset email was not sent.",
  );
  throw new Error("Email delivery is not configured.");
}
