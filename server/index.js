import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import apiRoutes from "./routes/api.js";
import { config, assertConfigIsValid } from "./config.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { attachUser } from "./middleware/requireAuth.js";
import { cleanupExpiredSessions } from "./auth.js";
import { seedProductsIfEmpty } from "./db.js";
import { bootstrapAdminAccount } from "./bootstrap.js";

assertConfigIsValid();

const app = express();

// Required for req.ip / rate-limiting to see the real client IP when
// the app runs behind a reverse proxy or load balancer (see TRUST_PROXY
// in config.js). Left off by default for local development.
if (config.trustProxy) {
  app.set("trust proxy", 1);
}

// --- Security & platform middleware -------------------------------------
// This is a pure JSON API (no HTML is ever served from it), so we disable
// helmet's HTML-oriented defaults that don't apply and would only add
// noise, and keep the headers that matter for an API: no sniffing, no
// framing, no cross-origin resource leaking, and a locked-down CSP as a
// defense-in-depth measure in case an error page or future HTML route is
// ever added.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (no Origin header),
      // e.g. curl, server-to-server health checks.
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
    // Required so the browser will send/receive the session cookie on
    // cross-origin requests (frontend and API on different origins in
    // production). Safe only because origin above is an explicit
    // allowlist, never a wildcard.
    credentials: true,
  }),
);
app.use(express.json({ limit: config.bodyLimit }));
app.use(cookieParser());
app.use(attachUser);
app.use(morgan(config.env === "production" ? "combined" : "dev"));

// --- Routes ---------------------------------------------------------------
app.use("/api", apiRoutes);

// --- 404 + centralized error handling (must be registered last) ----------
app.use(notFoundHandler);
app.use(errorHandler);

// Both are idempotent (seed only runs if products table is empty; bootstrap
// only runs if no admin exists yet), and must complete before the server
// starts accepting requests so the admin panel has data/access from the
// first request onward.
await seedProductsIfEmpty();
await bootstrapAdminAccount();

const server = app.listen(config.port, () => {
  console.log(
    `[Volamp Server] Backend running at http://localhost:${config.port} (${config.env})`,
  );
});

// Sweep expired session rows every hour instead of relying solely on lazy
// cleanup-on-use, so abandoned sessions don't sit in the DB indefinitely.
const sessionSweepInterval = setInterval(
  () => {
    try {
      cleanupExpiredSessions();
    } catch (err) {
      console.error("[Volamp Server] Session sweep failed:", err.message);
    }
  },
  60 * 60 * 1000,
).unref();

// Fail loudly instead of silently swallowing startup errors
// (e.g. port already in use).
server.on("error", (err) => {
  console.error("[Volamp Server] Failed to start:", err.message);
  process.exit(1);
});

// Graceful shutdown: stop accepting new connections and let in-flight
// requests finish before exiting, instead of dropping them mid-response.
function shutdown(signal) {
  console.log(`[Volamp Server] ${signal} received, shutting down...`);
  clearInterval(sessionSweepInterval);
  server.close(() => {
    console.log("[Volamp Server] Closed all connections. Bye!");
    process.exit(0);
  });

  // Force-exit if connections don't close in time.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
