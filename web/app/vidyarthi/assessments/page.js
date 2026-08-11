"use client";
// Assessments — formal exam schedule (dem_exam_master) + my results
// (dem_student_marks), with AI study advice for the weakest subject.
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { generateContent } from "../../../lib/aiService";

export default function AssessmentsPage() {
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [advice, setAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    Promise.all([apiGet("/exams").catch(() => []), apiGet("/marks").catch(() => [])])
      .then(([e, m]) => { setExams(e || []); setMarks(m || []); });
  }, []);

  const weakest = marks.length
    ? marks.reduce((lo, m) => ((m.percentage ?? 101) < (lo.percentage ?? 101) ? m : lo), marks[0])
    : null;

  async function getAdvice() {
    if (!weakest?.subject) return;
    setLoadingAdvice(true); setAdvice("");
    try {
      const res = await generateContent(weakest.subject, "Average");
      setAdvice(res?.content || res?.text || res?.generated_text || (res ? JSON.stringify(res) : "No advice returned."));
    } finally { setLoadingAdvice(false); }
  }

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">परीक्षा</span> · Assessments</h1>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 18 }}>Exam Schedule</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginTop: 12 }}>
        {exams.map((e) => (
          <div key={e.exam_id} className="vb-card">
            <div style={{ fontWeight: 600 }}>{e.exam_name}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{e.exam_type} · {e.academic_year}</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>{e.start_date} → {e.end_date}</div>
          </div>
        ))}
        {exams.length === 0 && <div className="vb-card">No exams scheduled.</div>}
      </div>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 24 }}>My Results</h2>
      <div className="vb-card" style={{ marginTop: 12, padding: 0, overflowX: "auto" }}>
        {marks.length === 0 ? <div style={{ padding: 20, color: "var(--muted)" }}>No results yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th style={c}>Subject</th><th style={c}>Exam</th><th style={c}>Marks</th><th style={c}>%</th><th style={c}>Grade</th>
            </tr></thead>
            <tbody>{marks.map((m) => (
              <tr key={m.marks_id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={c}>{m.subject}</td><td style={c}>{m.exam}</td>
                <td style={c}>{m.marks_obtained}/{m.max_marks}</td><td style={c}>{m.percentage}%</td>
                <td style={c}><span className="vb-pill">{m.grade}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {weakest && (
        <div className="vb-card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 18 }}>AI Study Advice — {weakest.subject}</h2>
            <button className="vb-btn" style={{ background: "var(--saffron)", color: "#fff" }} onClick={getAdvice} disabled={loadingAdvice}>
              {loadingAdvice ? "Thinking…" : "Get advice"}
            </button>
          </div>
          {advice && <p style={{ marginTop: 12, whiteSpace: "pre-wrap", color: "#6F5B45" }}>{advice}</p>}
        </div>
      )}
    </>
  );
}

const c = { padding: "12px 20px" };
