import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../adminApi";

const CARDS = [
  ["totalDemo", "Total Demo Requests", "/admin/demo-requests"],
  ["newDemo", "New Demo Requests", "/admin/demo-requests?status=NEW"],
  ["totalEnquiries", "Total Enquiries", "/admin/enquiries"],
  ["newEnquiries", "New Enquiries", "/admin/enquiries?status=NEW"],
  ["contacted", "Contacted", "/admin/enquiries?status=CONTACTED"],
  ["completed", "Completed", "/admin/enquiries?status=COMPLETED"],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stats().then((r) => setStats(r.data)).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of incoming demo requests and general enquiries.</p>
      {error && <p className="error">{error}</p>}
      {!stats && !error && <p className="empty">Loading…</p>}
      {stats && (
        <div className="cards">
          {CARDS.map(([key, label, to]) => (
            <Link to={to} key={key} className="card">
              <div className="num">{stats[key] ?? 0}</div>
              <div className="lbl">{label}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
