import { useState } from "react";
import { api, setToken } from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, setState] = useState({ loading: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: null });
    try {
      const res = await api.login(form.email, form.password);
      setToken(res.data.accessToken);
      window.location.href = "/";
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>THAMIZORA Admin</h1>
        <p>Sign in to manage enquiries and demo requests.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="username"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {state.error && <p className="error">{state.error}</p>}
        <button className="btn" type="submit" disabled={state.loading} style={{ width: "100%", marginTop: 8 }}>
          {state.loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
