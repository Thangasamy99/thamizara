import ApiError from "../utils/ApiError.js";

/**
 * Permission gate — the caller needs at least one of the given codes.
 * Use after requireAuth: requirePermission('leads.update')
 */
export const requirePermission = (...codes) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (codes.some((c) => req.user.permissions.has(c))) return next();
  next(ApiError.forbidden());
};

/** Role gate — for rules that are inherently role-shaped, e.g. SUPER_ADMIN-only ops. */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.roles.some((r) => roles.includes(r))) return next();
  next(ApiError.forbidden());
};

/** True when the user is a member of the project team or manages it. */
export const isProjectMember = (req, memberIds = [], managerId = null) =>
  req.user.id === managerId || memberIds.includes(req.user.id);
