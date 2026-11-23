/** Consistent API envelope: { success, message, data, meta }. */
export const ok = (res, message, data = {}, meta = undefined, status = 200) =>
  res.status(status).json({ success: true, message, data, meta });

export const created = (res, message, data = {}) =>
  ok(res, message, data, undefined, 201);

export const page = (res, message, rows, { page: p, limit, total }) =>
  ok(res, message, rows, {
    page: p,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
