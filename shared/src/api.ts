// Platform-agnostic API client — used by web (Next.js) and mobile (React Native).
// Token STORAGE differs per platform (web: localStorage, mobile: SecureStore),
// so each app injects a `getToken` function; this client only reads it.

import type { LoginResult, Role } from "./types";

export interface ApiConfig {
  baseUrl: string;                       // e.g. https://vidhyabharathi.swais.in
  getToken: () => Promise<string | null> | string | null;
}

export function createApiClient(config: ApiConfig) {
  async function request(path: string, options: RequestInit = {}) {
    const token = await config.getToken();
    const res = await fetch(`${config.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data && (data.detail || data.message)) || `Request failed (${res.status})`);
    }
    return data;
  }

  return {
    request,

    // --- Auth (Pravesha) ---
    checkEmail: (email: string, role: Role): Promise<{ exists: boolean }> =>
      request("/api/auth/check-email", { method: "POST", body: JSON.stringify({ email, role }) }),

    login: (email: string, role: Role, googleToken?: string): Promise<LoginResult> =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, role, googleToken }) }),

    checkPhone: (phone: string, role: Role) =>
      request("/api/auth/check-phone", { method: "POST", body: JSON.stringify({ phone, role }) }),

    verifyOtp: (phone: string, role: Role, otp: string): Promise<LoginResult> =>
      request("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, role, otp }) }),

    me: () => request("/api/v1/auth/me"),

    // --- generic helpers for module endpoints ---
    get: (path: string) => request(path),
    post: (path: string, body: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
