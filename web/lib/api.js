// Vidyarthi API helper — centralizes auth so every page auto-logs-in as a
// Vidyarthi (demo) and sends the Bearer token. Real Google/OTP login later.
const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "vb_token";

async function ensureToken() {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  try {
    const r = await fetch(`${API}/api/v1/pravesha/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "Vidyarthi" }),
    });
    if (r.ok) {
      token = (await r.json()).access_token;
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    }
  } catch {}
  return null;
}

export async function apiGet(path) {
  const token = await ensureToken();
  const r = await fetch(`${API}/api/v1/vidyarthi${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

export async function apiPost(path, body) {
  const token = await ensureToken();
  const r = await fetch(`${API}/api/v1/vidyarthi${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(`POST ${path} -> ${r.status}`);
  return r.json();
}

export { API };
