import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../adminApi";

const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const NEXT = {
  NEW: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["COMPLETED", "CANCELLED", "NEW"],
  COMPLETED: ["CONTACTED"],
  CANCELLED: ["NEW"],
};

export default function SubmissionDetail() {
  const { id } = useParams();
  const [sub, setSub] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = () => api.submission(id).then((r) => setSub(r.data.submission)).catch((e) => setError(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const setStatus = async (status) => {
    setError(null);
    try {
      await api.setStatus(id, status);
      await load();
    } catch (e) { setError(e.message); }
  };

  const copy = async (label, value) => {
    await navigator.clipboard.writeText(value ?? "");
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  if (error && !sub) return <p className="error">{error}</p>;
  if (!sub) return <p className="empty">Loading…</p>;

  const back = sub.type === "DEMO_REQUEST" ? "/admin/demo-requests" : "/admin/enquiries";

  return (
    <>
      <p className="page-sub"><Link to={back}>← Back to list</Link></p>
      <h1 className="page-title">
        {sub.reference} <span className={`badge ${sub.status}`} style={{ verticalAlign: "middle" }}>{sub.status}</span>
      </h1>
      <p className="page-sub">
        {sub.type === "DEMO_REQUEST" ? "Demo request" : "General enquiry"} · submitted {fmtDate(sub.createdAt)}
      </p>

      <div className="filters" style={{ marginBottom: 20 }}>
        {(NEXT[sub.status] ?? []).map((s) => (
          <button key={s} className="btn" onClick={() => setStatus(s)}>Mark {s}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}

      <div className="detail-grid">
        <div className="dl"><div className="k">Name</div><div className="v">{sub.name}</div></div>
        <div className="dl">
          <div className="k">Email</div>
          <div className="v">
            {sub.email}{" "}
            <button className="btn ghost sm" onClick={() => copy("email", sub.email)}>
              {copied === "email" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="dl">
          <div className="k">Phone / WhatsApp</div>
          <div className="v">
            {sub.phone || sub.whatsapp || "—"}{" "}
            {(sub.phone || sub.whatsapp) && (
              <button className="btn ghost sm" onClick={() => copy("phone", sub.phone || sub.whatsapp)}>
                {copied === "phone" ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>
        <div className="dl"><div className="k">Country</div><div className="v">{sub.country || "—"}</div></div>
        <div className="dl"><div className="k">Organization</div><div className="v">{sub.organization || "—"}</div></div>
        <div className="dl">
          <div className="k">{sub.type === "DEMO_REQUEST" ? "Application" : "Enquiry Category"}</div>
          <div className="v">{sub.category || "—"}</div>
        </div>
      </div>

      {sub.message && (
        <>
          <h2 className="page-title" style={{ fontSize: 16, marginTop: 24 }}>Message</h2>
          <div className="msg-box">{sub.message}</div>
        </>
      )}
    </>
  );
}
