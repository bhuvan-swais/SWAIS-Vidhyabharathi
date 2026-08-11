// Mobile API client — mirrors web/lib/api.js. Auto-logs-in as a Vidyarthi (demo)
// and sends the Bearer token stored on the device (expo-secure-store).
import Constants from "expo-constants";
import { getToken, saveToken, saveRole } from "./lib/token";

export const API = (Constants.expoConfig?.extra?.apiBaseUrl || "http://192.168.1.3:8000").replace(/\/+$/, "");

async function ensureToken() {
  let token = await getToken();
  if (token) return token;
  try {
    const r = await fetch(`${API}/api/v1/pravesha/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "Vidyarthi" }),
    });
    if (r.ok) {
      const d = await r.json();
      await saveToken(d.access_token);
      await saveRole(d.role || "Vidyarthi");
      return d.access_token;
    }
  } catch {}
  return null;
}

// Explicit login (LoginScreen) — email optional; resolves a real student.
export async function login(email, role = "Vidyarthi") {
  const r = await fetch(`${API}/api/v1/pravesha/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email || undefined, role }),
  });
  if (!r.ok) throw new Error(`login ${r.status}`);
  const d = await r.json();
  await saveToken(d.access_token);
  await saveRole(d.role || role);
  return d;
}

export async function apiGet(path) {
  const token = await ensureToken();
  const r = await fetch(`${API}/api/v1/vidyarthi${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function apiPost(path, body) {
  const token = await ensureToken();
  const r = await fetch(`${API}/api/v1/vidyarthi${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(`POST ${path} ${r.status}`);
  return r.json();
}
