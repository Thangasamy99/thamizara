import { z } from "zod";
import { ROLES } from "../auth/rbac.data.js";

const idList = z.array(z.coerce.number().int().positive()).default([]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(190),
  password: z.string().min(8).max(128).optional(),
  phone: z.string().trim().max(50).optional(),
  profileImageUrl: z.string().trim().url().max(500).optional(),
  roles: z.array(z.enum(ROLES)).min(1, "At least one role is required"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  email: z.string().trim().email().max(190).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  profileImageUrl: z.string().trim().url().max(500).nullable().optional(),
}).refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export const updateRolesSchema = z.object({
  roles: z.array(z.enum(ROLES)).min(1, "At least one role is required"),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export { idList };
