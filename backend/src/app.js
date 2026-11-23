import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import logger from "./utils/logger.js";
import { ok } from "./utils/respond.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { checkDb, dbContext, closeRequestPool } from "./database/pool.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter, publicLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import rolesRoutes, { permissionsRouter } from "./modules/users/roles.routes.js";
import publicRoutes from "./modules/public/public.routes.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";
import submissionsRoutes from "./modules/submissions/submissions.routes.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // behind Nginx — needed for real client IPs / rate limits

app.use(helmet());
const corsOptions = (req) => ({
  origin: (origin, cb) => {
    // Non-browser clients (no Origin header), the configured allowlist,
    // and our own deployed site/admin origins.
    const allowed = new Set([
      ...env.CORS_ORIGINS, env.PUBLIC_SITE_URL, env.ADMIN_APP_URL,
    ]);
    if (!origin || allowed.has(origin)) return cb(null, true);
    // Same-origin request (browser hitting this host directly) — always fine.
    try {
      if (new URL(origin).host === req.headers.host) return cb(null, true);
    } catch { /* fall through to rejection */ }
    // In development, any localhost/127.0.0.1 origin is fine (Vite, previews).
    if (!env.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
app.use((req, res, next) => cors(corsOptions(req))(req, res, next));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
// pino-http breaks under workerd bundling — use it on Node, a minimal
// request log on Workers.
if (isWorkers) {
  app.use((req, res, next) => {
    res.once("finish", closeRequestPool);
    if (req.url !== "/health") {
      res.once("finish", () =>
        logger.info({ method: req.method, url: req.url, status: res.statusCode }, "request"));
    }
    dbContext.run({}, next);
  });
} else {
  const { pinoHttp } = await import("pino-http");
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));
}

// Liveness probe — always 200; reports dependency status.
app.get(
  "/health",
  asyncHandler(async (_req, res) =>
    ok(res, "ok", {
      status: "ok",
      db: await checkDb(),
      uptime: process.uptime(),
      env: env.NODE_ENV,
      version: "v1",
    }),
  ),
);

const api = express.Router();
api.use(apiLimiter);
api.get(
  "/health",
  asyncHandler(async (_req, res) =>
    ok(res, "ok", { status: "ok", db: await checkDb() }),
  ),
);
api.use("/auth", authLimiter, authRoutes);
api.use("/public", publicLimiter, publicRoutes);
api.use("/users", usersRoutes);
api.use("/roles", rolesRoutes);
api.use("/permissions", permissionsRouter);
api.use("/leads", leadsRoutes);
api.use("/customers", customersRoutes);
api.use("/admin/submissions", submissionsRoutes);
app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

export default app;
