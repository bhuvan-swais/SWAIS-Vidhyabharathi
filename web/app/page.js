"use client";
import { useEffect, useRef, useState } from "react";
import SwaisLogo from "./components/SwaisLogo";
import RoleSelect from "./components/RoleSelect";
import "./login.css";

const KOSHA = [
  { sk: "शारीरिक", en: "PHYSICAL" },
  { sk: "प्राणिक", en: "VITAL" },
  { sk: "मानसिक", en: "MENTAL" },
  { sk: "बौद्धिक", en: "INTELLECTUAL" },
  { sk: "आध्यात्मिक", en: "SPIRITUAL" },
];

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
// role path (from RoleSelect) -> API role name (backend ROLE_MAP)
const PATH_TO_ROLE = {
  "/vidyarthi": "Vidyarthi", "/acharya": "Acharya", "/palaka": "Palaka",
  "/pradhana": "Pradhana Acharya", "/nyasa": "Nyasa",
};

function encodeState(o) {
  return btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeState(s) {
  try {
    const b = s.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b.padEnd(Math.ceil(b.length / 4) * 4, "=")));
  } catch { return null; }
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [role, setRole] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [message, setMessage] = useState("");
  const otpRefs = useRef([]);

  const handleOtpChange = (i, val) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  async function postJson(path, body) {
    const r = await fetch(`${API_BASE}/api/v1/pravesha${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const detail = typeof data.detail === "string" ? data.detail : "";
      throw new Error(r.status === 404 ? "Not authorised to login" : (detail || "Something went wrong."));
    }
    return data;
  }

  function completeLogin(data) {
    if (!data.access_token) { setMessage("Authentication could not be completed."); return; }
    localStorage.setItem("vb_token", data.access_token);
    setRedirecting(true);
    const path = role || "/vidyarthi";
    window.location.assign(`${path}?token=${encodeURIComponent(data.access_token)}`);
  }

  function startGoogleVerification(ctx) {
    const state = encodeState({ email: ctx.email, role: ctx.role, nonce: crypto.randomUUID?.() || String(Date.now()) });
    // const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const redirectUri = window.location.origin;
    sessionStorage.setItem("vbPendingGoogle", JSON.stringify({ ...ctx, state, path: role }));
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID, redirect_uri: redirectUri, response_type: "id_token",
      scope: "openid email profile", nonce: crypto.randomUUID?.() || String(Date.now()),
      state, prompt: "select_account",
    });
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  // Handle the Google redirect back (id_token in the URL hash).
  useEffect(() => {
    if (!window.location.hash.includes("id_token")) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("id_token");
    const state = params.get("state");
    const pending = JSON.parse(sessionStorage.getItem("vbPendingGoogle") || "null");
    const ctx = pending?.state === state ? pending : decodeState(state || "");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token || !ctx?.email || !ctx?.role) { setMessage("Google authentication failed. Please try again."); return; }
    sessionStorage.removeItem("vbPendingGoogle");
    if (ctx.path) setRole(ctx.path);
    setLoading(true);
    postJson("/login", { email: ctx.email, role: ctx.role, google_token: token })
      .then((d) => { role || setRole(ctx.path || "/vidyarthi"); completeLogin({ ...d, _path: ctx.path }); })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // One adaptive action. Label + behavior follow the same priority:
  // OTP entered -> Verify & Continue · mobile entered -> Send OTP · else -> Continue (email/Google).
  const primaryLabel = loading
    ? "Please wait…"
    : otpSent ? "Verify & Continue"
    : mobile.trim() ? "Send OTP"
    : "Continue";

  async function handlePrimary() {
    if (!role) { setMessage("Please select your role first."); return; }
    setLoading(true); setMessage("");
    try {
      // 1) OTP already sent -> verify it
      if (otpSent) {
        const code = otp.join("");
        if (code.length !== 6) { setMessage("Enter the 6-digit OTP."); return; }
        completeLogin(await postJson("/verify-otp", { phone: mobile.trim(), role: PATH_TO_ROLE[role], otp: code }));
        return;
      }
      // 2) Mobile entered -> send OTP
      if (mobile.trim()) {
        const res = await postJson("/check-phone", { phone: mobile.trim(), role: PATH_TO_ROLE[role] });
        setOtpSent(true);
        setMessage(res.devOtp
          ? `OTP sent (test mode): ${res.devOtp} — valid ${res.expiresInMinutes} min.`
          : `OTP sent to your mobile. Valid for ${res.expiresInMinutes} minutes.`);
        return;
      }
      // 3) Email -> Google (or direct login if Google isn't configured)
      if (email.trim()) {
        await postJson("/check-email", { email: email.trim(), role: PATH_TO_ROLE[role] });
        if (GOOGLE_CLIENT_ID) { startGoogleVerification({ email: email.trim(), role: PATH_TO_ROLE[role] }); return; }
        completeLogin(await postJson("/login", { email: email.trim(), role: PATH_TO_ROLE[role] }));
        return;
      }
      setMessage("Enter your email, or your mobile number for OTP.");
    } catch (e) { setMessage(e.message); } finally { setLoading(false); }
  }

  if (redirecting) return (
    <div className="redir-overlay">
      <div className="redir-spinner" />
      <p className="redir-text"><span className="dev">प्रवेश हो रहा है</span> · Entering…</p>
    </div>
  );

  return (
    <div className="login-page">
      {/* ===================== LEFT ===================== */}
      <section className="left">
        <SunRays className="sun-bg" />
        <MandalaOutline className="mandala-bg" />

        <header className="topbar">
          <SwaisLogo />
          <div className="vb">VIDYA BHARATI · <span className="dev">विद्या भारती</span></div>
        </header>

        <div className="lwrap">
          <span className="pill">✧ HOLISTIC LEARNING PLATFORM</span>
          <h1><span className="dev">स्वागतम्</span> <span className="h-en">(Welcome)</span></h1>
          <p className="lead">
            Sign in to continue your journey with SWAIS VidhyaBharathi — a learning
            community rooted in the five-fold vision of Vidya Bharati.
          </p>

          <div className="card">
            {/* Role */}
            <label className="lbl" htmlFor="role"><span className="dev">भूमिका चुनें</span> <span className="lbl-en">(Select your role)</span></label>
            <RoleSelect value={role} onChange={setRole} />

            {/* Method separator */}
            <div className="method-sep"><span>Login with</span></div>

            {/* Tab switcher */}
            <div className="method-tabs">
              <button
                type="button"
                className={`method-tab${loginMethod === "email" ? " active" : ""}`}
                onClick={() => { setLoginMethod("email"); setMobile(""); setOtpSent(false); setOtp(Array(6).fill("")); setMessage(""); }}
              >
                <MailIcon /> <span className="dev">ईमेल</span> · Email
              </button>
              <button
                type="button"
                className={`method-tab${loginMethod === "mobile" ? " active" : ""}`}
                onClick={() => { setLoginMethod("mobile"); setEmail(""); setMessage(""); }}
              >
                <PhoneIcon /> <span className="dev">दूरभाष</span> · Mobile
              </button>
            </div>

            {/* Input area — animates on tab switch */}
            <div className="tab-content" key={loginMethod}>
              {loginMethod === "email" ? (
                <div className="field">
                  <span className="ic"><MailIcon /></span>
                  <input id="email" type="email" placeholder="you@school.in"
                         value={email} onChange={(e) => setEmail(e.target.value)}
                         onKeyDown={(e) => e.key === "Enter" && handlePrimary()} />
                </div>
              ) : (
                <>
                  <div className="field">
                    <span className="ic"><PhoneIcon /></span>
                    <span className="cc">+91</span>
                    <input id="mobile" type="tel" inputMode="numeric" placeholder="98765 43210"
                           value={mobile} onChange={(e) => { setMobile(e.target.value); setOtpSent(false); }}
                           onKeyDown={(e) => e.key === "Enter" && handlePrimary()} />
                  </div>
                  {otpSent && (
                    <div className="otp-row" role="group" aria-label="Enter 6 digit OTP">
                      {otp.map((d, i) => (
                        <input key={i} ref={(el) => (otpRefs.current[i] = el)} className="otp-box"
                               inputMode="numeric" maxLength={1} value={d}
                               onChange={(e) => handleOtpChange(i, e.target.value)}
                               onKeyDown={(e) => handleOtpKey(i, e)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <button type="button" className="continue" onClick={handlePrimary} disabled={loading}>
              <span className="dev">आगे बढ़ें</span> · {primaryLabel} <ArrowIcon />
            </button>

            {message && <p className="login-msg" role="status">{message}</p>}

            <p className="pledge">
              By continuing you honour our shared <span className="dev">वचन</span> (pledge)
              to learn with truth, discipline, and joy.
            </p>
          </div>

          <p className="lfoot"><b>Powered by Vidya Bharati values</b> · © 2026 SWAIS VidhyaBharathi</p>
        </div>
      </section>

      {/* ===================== RIGHT ===================== */}
      <aside className="right">
        <Chakra className="chakra" />
        <span className="r-pill"><span className="dev">सरस्वती</span> · SARASWATI</span>
        <div className="shloka dev">या कुन्देन्दुतुषारहारधवला</div>
        <p className="trans">
          “She who is fair as the jasmine, moon and snow — Devi Saraswati,
          bestower of true knowledge, we bow to you.”
        </p>

        <ul className="kosha">
          {KOSHA.map((k) => (
            <li key={k.en} className="krow">
              <span className="kbar" />
              <div><span className="sk dev">{k.sk}</span><span className="k-en">{k.en}</span></div>
            </li>
          ))}
        </ul>

        <div className="r-foot"><span className="dev">पञ्च कोश विकास</span> · THE FIVE-FOLD PATH</div>
      </aside>
    </div>
  );
}

/* ---------- inline icons ---------- */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="ic-svg"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="ic-svg"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z" /></svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" className="arrow"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

/* ---------- decorative motifs ---------- */
const r3 = (n) => Number(n.toFixed(3)); // round so SSR and client output match (avoids hydration warning)
const SunRays = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    <g stroke="#F28C28" strokeWidth="1.2">
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI) / 8;
        return <line key={i} x1="50" y1="50" x2={r3(50 + 48 * Math.cos(a))} y2={r3(50 + 48 * Math.sin(a))} />;
      })}
    </g>
  </svg>
);
const MandalaOutline = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="#C0562A" strokeWidth="1">
      <circle cx="100" cy="100" r="96" /><circle cx="100" cy="100" r="72" /><circle cx="100" cy="100" r="48" />
      <ellipse cx="100" cy="40" rx="12" ry="24" /><ellipse cx="100" cy="160" rx="12" ry="24" />
      <ellipse cx="40" cy="100" rx="24" ry="12" /><ellipse cx="160" cy="100" rx="24" ry="12" />
    </g>
  </svg>
);
const Chakra = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="#fff" strokeWidth="0.8">
      <circle cx="100" cy="100" r="98" /><circle cx="100" cy="100" r="80" /><circle cx="100" cy="100" r="60" />
      <circle cx="100" cy="100" r="40" /><circle cx="100" cy="100" r="20" />
      <g strokeWidth="0.6">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={r3(100 + 98 * Math.cos(a))} y1={r3(100 + 98 * Math.sin(a))} x2={r3(100 - 98 * Math.cos(a))} y2={r3(100 - 98 * Math.sin(a))} />;
        })}
      </g>
    </g>
  </svg>
);
