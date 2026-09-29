"use client";
// Progress — exam marks (vb_student_marks) + past quiz scores (vb_quiz_response).
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function ProgressPage() {
  const [marks, setMarks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGet("/marks").catch(() => []), apiGet("/quiz-responses").catch(() => [])])
      .then(([m, q]) => { setMarks(m || []); setQuizzes(q || []); })
      .finally(() => setLoading(false));
  }, []);

  const avg = marks.length
    ? Math.round(marks.map((m) => m.percentage).filter((x) => x != null).reduce((a, b, _, arr) => a + b / arr.length, 0))
    : null;

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">प्रगति</span> · Progress</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16, marginTop: 16 }}>
        <Stat label="Avg Score" value={avg != null ? avg + "%" : "—"} />
        <Stat label="Exams Recorded" value={marks.length} />
        <Stat label="Quizzes Taken" value={quizzes.length} />
      </div>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 26 }}>Exam Marks</h2>
      <div className="vb-card" style={{ marginTop: 12, padding: 0, overflowX: "auto" }}>
        {loading ? <div style={{ padding: 20 }}>Loading…</div> : marks.length === 0 ? (
          <div style={{ padding: 20, color: "var(--muted)" }}>No marks recorded yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={th}>Subject</th><th style={th}>Exam</th><th style={th}>Marks</th><th style={th}>%</th><th style={th}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => (
                <tr key={m.marks_id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={td}>{m.subject || "—"}</td>
                  <td style={td}>{m.exam || "—"}</td>
                  <td style={td}>{m.marks_obtained}/{m.max_marks}</td>
                  <td style={td}>{m.percentage != null ? m.percentage + "%" : "—"}</td>
                  <td style={td}><span className="vb-pill">{m.grade || "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 26 }}>Quiz History</h2>
      <div className="vb-card" style={{ marginTop: 12, padding: 0 }}>
        {quizzes.length === 0 ? (
          <div style={{ padding: 20, color: "var(--muted)" }}>No quizzes taken yet.</div>
        ) : quizzes.map((q, i) => (
          <div key={q.response_id} style={{ padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : "none", display: "flex", justifyContent: "space-between" }}>
            <span>Quiz #{q.quiz_id}</span>
            <span style={{ fontWeight: 600, color: "var(--saffron-deep)" }}>{q.score != null ? q.score : "—"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const th = { padding: "12px 20px", fontWeight: 600 };
const td = { padding: "12px 20px" };

function Stat({ label, value }) {
  return (
    <div className="vb-card">
      <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--saffron-deep)" }}>{value}</div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}
