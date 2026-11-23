import ApiError from "../utils/ApiError.js";

/**
 * Validates req[part] ("body" | "query" | "params") against a Zod schema and
 * replaces it with the parsed (sanitised) value — protects against mass
 * assignment by stripping unknown keys on strict schemas.
 */
export const validate = (schema, part = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    return next(
      ApiError.badRequest(
        "Validation failed",
        result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      ),
    );
  }
  req[part] = result.data;
  next();
};
