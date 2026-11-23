const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const TOKEN_KEY = "tmz_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    setToken(null);
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(data?.message ?? `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me"),
  stats: () => request("/admin/submissions/stats"),
  submissions: (params) => request(`/admin/submissions?${new URLSearchParams(params)}`),
  submission: (id) => request(`/admin/submissions/${id}`),
  setStatus: (id, status) => request(`/admin/submissions/${id}/status`, { method: "PATCH", body: { status } }),
};
