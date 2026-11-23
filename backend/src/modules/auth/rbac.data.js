/**
 * Central permission catalogue and role → permission matrix.
 * `seedRbac()` applies this idempotently; it is the single source of truth.
 */

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES_MANAGER",
  "PROJECT_MANAGER",
  "STAFF",
];

export const PERMISSIONS = [
  "dashboard.read",
  "users.read", "users.create", "users.update", "users.deactivate",
  "leads.read", "leads.create", "leads.update", "leads.assign", "leads.convert",
  "customers.read", "customers.create", "customers.update",
  "quotations.read", "quotations.create", "quotations.update",
  "quotations.send", "quotations.approve", "quotations.cancel",
  "projects.read", "projects.create", "projects.update", "projects.assign",
  "tasks.read", "tasks.create", "tasks.update", "tasks.assign",
  "followups.read", "followups.create", "followups.update",
  "reports.read", "reports.export",
  "settings.read", "settings.update",
  "audit.read",
];

const ALL = [...PERMISSIONS];

export const ROLE_PERMISSIONS = {
  // Wildcard: every permission, current and future.
  SUPER_ADMIN: ALL,
  // Business management: everything except settings.update.
  // SUPER_ADMIN-role assignment is additionally restricted in service code.
  ADMIN: ALL.filter((p) => p !== "settings.update"),
  SALES_MANAGER: [
    "dashboard.read",
    "leads.read", "leads.create", "leads.update", "leads.assign", "leads.convert",
    "customers.read", "customers.create", "customers.update",
    "quotations.read", "quotations.create", "quotations.update", "quotations.send",
    "followups.read", "followups.create", "followups.update",
    "reports.read",
  ],
  PROJECT_MANAGER: [
    "dashboard.read",
    "leads.read",
    "customers.read",
    "quotations.read",
    "projects.read", "projects.create", "projects.update", "projects.assign",
    "tasks.read", "tasks.create", "tasks.update", "tasks.assign",
    "followups.read", "followups.create", "followups.update",
    "reports.read",
  ],
  STAFF: [
    "dashboard.read",
    "projects.read",
    "tasks.read", "tasks.update",
    "followups.read",
  ],
};
