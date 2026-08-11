"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [role, setRole] = useState("");
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

  // TODO: wire to backend /api/v1/pravesha (verify email/OTP or Google),
  // then route to the role returned by the token. For now, route by selection.
  const handleContinue = () => {
    if (!role) return;
    router.push(role);
  };

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
            <label className="lbl" htmlFor="email"><span className="dev">ईमेल</span> <span className="lbl-en">(Email)</span></label>
            <div className="field">
              <span className="ic"><MailIcon /></span>
              <input id="email" type="email" placeholder="you@school.in"
                     value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <label className="lbl" htmlFor="mobile"><span className="dev">दूरभाष</span> <span className="lbl-en">(Mobile)</span></label>
            <div className="field">
              <span className="ic"><PhoneIcon /></span>
              <span className="cc">+91</span>
              <input id="mobile" type="tel" inputMode="numeric" placeholder="98765 43210"
                     value={mobile} onChange={(e) => setMobile(e.target.value)} />
              <button type="button" className="otp-btn" onClick={() => setOtpSent(true)}>
                <span className="dev">OTP भेजें</span> (Send)
              </button>
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

            <div className="divider"><span className="dev">अथवा</span> · OR</div>

            <label className="lbl" htmlFor="role"><span className="dev">भूमिका चुनें</span> <span className="lbl-en">(Select your role)</span></label>
            <RoleSelect value={role} onChange={setRole} />

            <button type="button" className="continue" onClick={handleContinue} disabled={!role}>
              <span className="dev">आगे बढ़ें</span> · Continue <ArrowIcon />
            </button>

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
