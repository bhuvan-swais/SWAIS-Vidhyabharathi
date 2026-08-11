"use client";
// Settings — student profile (live) + language preference + logout.
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function SettingsPage() {
  const { selectedLanguage, changeLanguage, LANGUAGES } = useLanguage();
  const [student, setStudent] = useState(null);

  useEffect(() => { apiGet("/students/current").then((d) => setStudent(d?.student || null)).catch(() => {}); }, []);

  function logout() {
    if (typeof window !== "undefined") { localStorage.removeItem("vb_token"); location.href = "/"; }
  }

  const rows = student ? [
    ["Name", student.full_name], ["Admission No", student.admission_no],
    ["Class", student.class_id], ["Section", student.section],
    ["Roll No", student.roll_no], ["Email", student.email_id || "—"],
  ] : [];

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">सेटिंग्स</span> · Settings</h1>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 18 }}>Profile</h2>
      <div className="vb-card" style={{ marginTop: 12 }}>
        {!student ? <span style={{ color: "var(--muted)" }}>Loading…</span> : (
          <table style={{ width: "100%", fontSize: 14 }}>
            <tbody>{rows.map(([k, v]) => (
              <tr key={k}><td style={{ padding: "8px 0", color: "var(--muted)", width: 160 }}>{k}</td><td style={{ padding: "8px 0", fontWeight: 600 }}>{v}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 24 }}>Preferences</h2>
      <div className="vb-card" style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 600 }}>Preferred language</label>
        <select value={selectedLanguage} onChange={(e) => changeLanguage(e.target.value)}
          style={{ display: "block", marginTop: 8, padding: 10, borderRadius: 10, border: "1px solid var(--line)" }}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.name}>{l.name}</option>)}
        </select>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Used across the portal for AI translation and read-aloud.</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="vb-btn" style={{ background: "var(--saffron-deep)", color: "#fff" }} onClick={logout}>Log out</button>
      </div>
    </>
  );
}
