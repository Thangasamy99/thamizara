import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/respond.js";
import {
  loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema,
} from "./auth.schemas.js";
import * as svc from "./auth.service.js";

const router = Router();
const ctx = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });
const cookieOpts = svc.refreshCookieOptions;

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await svc.login(req.body, ctx(req));
    res
      .cookie(svc.REFRESH_COOKIE, refreshToken, cookieOpts)
      .json({ success: true, message: "Login successful", data: { user, accessToken } });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await svc.refresh(
      req.cookies?.[svc.REFRESH_COOKIE], ctx(req),
    );
    res
      .cookie(svc.REFRESH_COOKIE, refreshToken, cookieOpts)
      .json({ success: true, message: "Session refreshed", data: { user, accessToken } });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await svc.logout(req.cookies?.[svc.REFRESH_COOKIE], ctx(req));
    res.clearCookie(svc.REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
    ok(res, "Logged out");
  }),
);

router.post(
  "/logout-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await svc.logoutAll(req.user.id, ctx(req));
    res.clearCookie(svc.REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
    ok(res, "Logged out from all devices");
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) =>
    ok(res, "ok", {
      user: { ...req.user, permissions: [...req.user.permissions] },
    }),
  ),
);

router.put(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    await svc.changePassword(req.user.id, req.body, ctx(req));
    res.clearCookie(svc.REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
    ok(res, "Password changed successfully. Please log in again.");
  }),
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    await svc.forgotPassword(req.body.email, ctx(req));
    ok(res, "If an account exists for that email, a reset link has been sent.");
  }),
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    await svc.resetPassword(req.body, ctx(req));
    ok(res, "Password has been reset. Please log in with your new password.");
  }),
);

export default router;
