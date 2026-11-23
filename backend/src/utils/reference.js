/**
 * Monotonic per-year reference sequences backed by the `counters` table.
 *   "lead" → LD-2025-00007 · "quotation" → QT-2025-00012 · "customer" → CU-2025-00003
 */
const PREFIXES = {
  lead: "LD", quotation: "QT", customer: "CU", project: "PR",
  demo: "DR", enquiry: "EN",
};

export async function nextReference(conn, kind) {
  const year = new Date().getFullYear();
  const counterName = `${kind}:${year}`;
  await conn.query(
    "INSERT INTO counters (name, value) VALUES (?, 0) ON DUPLICATE KEY UPDATE value = value",
    [counterName],
  );
  await conn.query(
    "UPDATE counters SET value = LAST_INSERT_ID(value + 1) WHERE name = ?",
    [counterName],
  );
  const [[row]] = await conn.query("SELECT LAST_INSERT_ID() AS seq");
  return `${PREFIXES[kind] ?? kind.toUpperCase()}-${year}-${String(row.seq).padStart(5, "0")}`;
}
