import "dotenv/config";
import { z } from "zod";

const bool = (def) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : v === "true" || v === "1"));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_NAME: z.string().default("THAMIZARA API"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),

  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default("thamizora"),
  DB_USER: z.string().default("thamizora_app"),
  DB_PASSWORD: z.string().default(""),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  JWT_ISSUER: z.string().default("thamizara-api"),
  JWT_AUDIENCE: z.string().default("thamizara-admin"),
  JWT_ACCESS_SECRET: z.string().default("dev-only-secret-change-me"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().default("dev-only-secret-change-me"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  ADMIN_APP_URL: z.string().url().default("http://localhost:5174"),
  PUBLIC_SITE_URL: z.string().url().default("http://localhost:5173"),
  STATUS_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(180),
  IDEMPOTENCY_TTL_HOURS: z.coerce.number().int().positive().default(24),
  NOTIFICATION_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  NOTIFICATION_AUTODELIVER: bool(true),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  PUBLIC_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  LOG_LEVEL: z.string().default("info"),

  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: bool(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().default("THAMIZARA Technologies <no-reply@thamizara.com>"),
  ADMIN_NOTIFY_EMAILS: z
    .string()
    .default("")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;
env.isProd = env.NODE_ENV === "production";
env.isDev = env.NODE_ENV === "development";
env.isTest = env.NODE_ENV === "test";

// Fail fast on insecure configuration in production.
if (env.isProd) {
  const weak = [];
  if (env.JWT_ACCESS_SECRET.includes("change-me") || env.JWT_ACCESS_SECRET.length < 32)
    weak.push("JWT_ACCESS_SECRET");
  if (env.JWT_REFRESH_SECRET.includes("change-me") || env.JWT_REFRESH_SECRET.length < 32)
    weak.push("JWT_REFRESH_SECRET");
  if (!env.DB_PASSWORD) weak.push("DB_PASSWORD");
  if (weak.length) {
    console.error(`Refusing to start in production with insecure config: ${weak.join(", ")}`);
    process.exit(1);
  }
}

export default env;
