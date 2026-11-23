import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../adminApi";

const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function SubmissionsPage({ type, title }) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ rows: [], meta: null });
  const [error, setError] = useState(null);

  const filters = {
    type,
    page: params.get("page") ?? 1,
    status: params.get("status") ?? "",
    country: params.get("country") ?? "",
    search: params.get("search") ?? "",
  };

  const load = useCallback(() => {
    const q = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null));
    api.submissions(q)
      .then((r) => setData({ rows: r.data, meta: r.meta }))
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, params]);

  useEffect(load, [load]);

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    next.delete("page");
    setParams(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", p);
    setParams(next);
  };

  return (
    <>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">
        {type === "DEMO_REQUEST" ? "Requests for product demos." : "General enquiries from the contact form."}
      </p>

      <div className="filters">
        <input
          placeholder="Search name, email, phone, reference…"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
        <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <input
          placeholder="Country"
          value={filters.country}
          onChange={(e) => setFilter("country", e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Reference</th><th>Name</th><th>Email</th><th>Phone</th>
            <th>Country</th><th>Category</th><th>Date</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((s) => (
            <tr key={s.id}>
              <td className="ref">{s.reference}</td>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.phone || "—"}</td>
              <td>{s.country || "—"}</td>
              <td>{s.category || "—"}</td>
              <td>{fmtDate(s.createdAt)}</td>
              <td><span className={`badge ${s.status}`}>{s.status}</span></td>
              <td><Link to={`/admin/submissions/${s.id}`} className="btn ghost sm">View</Link></td>
            </tr>
          ))}
          {data.rows.length === 0 && (
            <tr><td colSpan="9" className="empty">No submissions found.</td></tr>
          )}
        </tbody>
      </table>

      {data.meta && Number(data.meta.totalPages) > 1 && (
        <div className="pager">
          <button className="btn ghost sm" disabled={Number(filters.page) <= 1}
            onClick={() => goPage(Number(filters.page) - 1)}>← Prev</button>
          Page {filters.page} of {data.meta.totalPages}
          <button className="btn ghost sm" disabled={Number(filters.page) >= Number(data.meta.totalPages)}
            onClick={() => goPage(Number(filters.page) + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
