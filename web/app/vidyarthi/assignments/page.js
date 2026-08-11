"use client";
// Assignments — list, submit (typed answer / file path), see marks & remarks,
// and translate an assignment into the selected language (AI service).
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { translateText } from "../../../lib/aiService";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function AssignmentsPage() {
  const { selectedLanguage } = useLanguage();
  const [assignments, setAssignments] = useState([]);
  const [subs, setSubs] = useState({});      // assignment_id -> submission
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [tx, setTx] = useState({});          // assignment_id -> translated text

  async function load() {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([apiGet("/assignments"), apiGet("/submissions").catch(() => [])]);
      setAssignments(Array.isArray(a) ? a : []);
      const map = {};
      (Array.isArray(s) ? s : []).forEach((x) => { map[x.assignment_id] = x; });
      setSubs(map);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit(assignmentId) {
    if (!answer.trim()) { setStatus("Type an answer first."); return; }
    setStatus("Submitting…");
    try {
      await apiPost("/submissions", { assignment_id: assignmentId, submission_text: answer });
      setStatus("Submitted ✓"); setAnswer(""); setOpenId(null); load();
    } catch (e) { setStatus("Failed: " + e.message); }
  }

  async function translate(a) {
    const res = await translateText(a.text || a.title || "", selectedLanguage);
    setTx((t) => ({ ...t, [a.assignment_id]: res?.translated_text || res?.text || "(no translation)" }));
  }

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">कार्य</span> · Assignments</h1>
      <p style={{ color: "var(--muted)", marginTop: 4 }}>{assignments.length} assignments · translating to <b>{selectedLanguage}</b></p>

      {loading ? <div className="vb-card" style={{ marginTop: 16 }}>Loading…</div> : (
        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {assignments.map((a) => {
            const sub = subs[a.assignment_id];
            return (
              <div key={a.assignment_id} className="vb-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{a.title || "Assignment"}</div>
                  <div style={{ color: "var(--muted)" }}>due {a.due_date || "—"}</div>
                </div>
                {a.text && <p style={{ color: "#6F5B45", marginTop: 8 }}>{a.text}</p>}
                {tx[a.assignment_id] && (
                  <p style={{ marginTop: 8, padding: 10, background: "var(--saffron-soft)", borderRadius: 10, color: "var(--saffron-deep)" }}>
                    {tx[a.assignment_id]}
                  </p>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="vb-btn" onClick={() => translate(a)}>🌐 Translate</button>
                  {sub ? (
                    <span className="vb-pill">
                      Submitted{sub.marks_obtained != null ? ` · ${sub.marks_obtained} marks` : " · awaiting grade"}
                    </span>
                  ) : (
                    <button className="vb-btn" onClick={() => { setOpenId(openId === a.assignment_id ? null : a.assignment_id); setAnswer(""); setStatus(""); }}>
                      ✍️ Submit
                    </button>
                  )}
                </div>
                {sub?.teacher_remarks && <p style={{ marginTop: 8, color: "var(--muted)" }}>Remarks: {sub.teacher_remarks}</p>}
                {openId === a.assignment_id && (
                  <div style={{ marginTop: 12 }}>
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4}
                      placeholder="Type your answer…"
                      style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--line)", fontFamily: "inherit" }} />
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                      <button className="vb-btn" style={{ background: "var(--saffron)", color: "#fff" }} onClick={() => submit(a.assignment_id)}>Send</button>
                      <span style={{ color: "var(--muted)" }}>{status}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
