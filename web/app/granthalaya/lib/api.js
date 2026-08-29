/**
 * Granthalaya API client — SWAIS VidhyaBharathi.
 *
 * Tokens are stored in localStorage under gl_token / gl_role.
 * glEnsureToken(uiRole) auto-logins via the demo shortcut (no email).
 *   "Student"  → Vidyarthi (demo shortcut exists in pravesha.py)
 *   "Teacher"  → Acharya   (requires Step-4 pravesha.py change; fails until then)
 *   "Admin"    → School Admin (same)
 *
 * All functions throw on non-2xx responses.
 */

const GL_TOKEN_KEY = "gl_token";
const GL_ROLE_KEY  = "gl_role";
const _API_BASE    = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const GL_API       = `${_API_BASE}/api/v1/granthalaya`;

const ROLE_MAP = {
  Student: "Vidyarthi",
  Teacher: "Acharya",
  Admin:   "School Admin",
};

/** Obtain (or refresh) a JWT for the given UI role. */
export async function glEnsureToken(uiRole) {
  const stored = typeof window !== "undefined" ? localStorage.getItem(GL_TOKEN_KEY) : null;
  const storedRole = typeof window !== "undefined" ? localStorage.getItem(GL_ROLE_KEY) : null;
  if (stored && storedRole === uiRole) return stored;

  const backendRole = ROLE_MAP[uiRole] || uiRole;
  const res = await fetch(`${_API_BASE}/api/v1/pravesha/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ role: backendRole }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Login failed: HTTP ${res.status}` }));
    throw new Error(err.detail || `Login failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error("Login response missing access_token");

  if (typeof window !== "undefined") {
    localStorage.setItem(GL_TOKEN_KEY, data.access_token);
    localStorage.setItem(GL_ROLE_KEY, uiRole);
  }
  return data.access_token;
}

/** Clear stored token (e.g. on explicit role switch). */
export function glClearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GL_TOKEN_KEY);
  localStorage.removeItem(GL_ROLE_KEY);
}

/** Core fetch wrapper — handles auth headers and one retry on 401. */
async function glFetch(uiRole, path, options = {}) {
  const isFormData = options.body instanceof FormData;

  async function attempt(token) {
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };
    return fetch(`${GL_API}${path}`, { ...options, headers });
  }

  let token = await glEnsureToken(uiRole);
  let res   = await attempt(token);

  if (res.status === 401) {
    glClearToken();
    token = await glEnsureToken(uiRole);
    res   = await attempt(token);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ------------------------------------------------------------------ books
export const glBooks = {
  list: (uiRole, params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return glFetch(uiRole, `/books${qs ? `?${qs}` : ""}`);
  },
  get:      (uiRole, id)       => glFetch(uiRole, `/books/${id}`),
  read:     (uiRole, id)       => glFetch(uiRole, `/books/${id}/read`),
  download: (uiRole, id)       => glFetch(uiRole, `/books/${id}/download`),
  create:   (uiRole, body)     => glFetch(uiRole, "/books", { method: "POST", body: JSON.stringify(body) }),
  update:   (uiRole, id, body) => glFetch(uiRole, `/books/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deactivate: (uiRole, id)     => glFetch(uiRole, `/books/${id}`, { method: "DELETE" }),
  /** S3 upload — returns { key, file_type }. Throws 503 until credentials are configured. */
  upload:   (uiRole, formData) => glFetch(uiRole, "/books/upload", { method: "POST", body: formData }),
};

// ------------------------------------------------------------------ categories
export const glCategories = {
  list:   (uiRole)           => glFetch(uiRole, "/categories"),
  create: (uiRole, body)     => glFetch(uiRole, "/categories", { method: "POST", body: JSON.stringify(body) }),
  update: (uiRole, id, body) => glFetch(uiRole, `/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (uiRole, id)       => glFetch(uiRole, `/categories/${id}`, { method: "DELETE" }),
};

// ------------------------------------------------------------------ book requests
export const glRequests = {
  mine:   (uiRole)           => glFetch(uiRole, "/requests/mine"),
  all:    (uiRole)           => glFetch(uiRole, "/requests"),
  create: (uiRole, body)     => glFetch(uiRole, "/requests", { method: "POST", body: JSON.stringify(body) }),
  decide: (uiRole, id, dec)  => glFetch(uiRole, `/requests/${id}/${dec}`, { method: "POST" }),
};

// ------------------------------------------------------------------ content reports
export const glReports = {
  all:     (uiRole)      => glFetch(uiRole, "/reports"),
  create:  (uiRole, body) => glFetch(uiRole, "/reports", { method: "POST", body: JSON.stringify(body) }),
  resolve: (uiRole, id)   => glFetch(uiRole, `/reports/${id}/resolve`, { method: "POST" }),
};

// ------------------------------------------------------------------ notifications
export const glNotifications = {
  list:       (uiRole)      => glFetch(uiRole, "/notifications"),
  markRead:   (uiRole, id)  => glFetch(uiRole, `/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead:(uiRole)      => glFetch(uiRole, "/notifications/read-all",   { method: "PATCH" }),
};

// ------------------------------------------------------------------ stats (admin)
export const glStats = {
  get: (uiRole) => glFetch(uiRole, "/stats"),
};
