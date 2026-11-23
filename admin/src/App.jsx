import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { getToken, setToken } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SubmissionsPage from "./pages/SubmissionsPage";
import SubmissionDetail from "./pages/SubmissionDetail";

const requireAuth = (el) => (getToken() ? el : <Navigate to="/login" replace />);

function Layout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="THAMIZARA"
            style={{ height: 40, width: "auto", borderRadius: 8, background: "#fff", padding: "4px 8px" }} />
          <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>Admin</span>
        </div>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/demo-requests">Demo Requests</NavLink>
        <NavLink to="/enquiries">General Enquiries</NavLink>
        <div className="foot">
          Signed in
          <button onClick={() => { setToken(null); window.location.href = `${import.meta.env.BASE_URL}login`; }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={requireAuth(<Layout><Dashboard /></Layout>)} />
        <Route
          path="/demo-requests"
          element={requireAuth(<Layout><SubmissionsPage type="DEMO_REQUEST" title="Demo Requests" /></Layout>)}
        />
        <Route
          path="/enquiries"
          element={requireAuth(<Layout><SubmissionsPage type="GENERAL_ENQUIRY" title="General Enquiries" /></Layout>)}
        />
        <Route
          path="/submissions/:id"
          element={requireAuth(<Layout><SubmissionDetail /></Layout>)}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
