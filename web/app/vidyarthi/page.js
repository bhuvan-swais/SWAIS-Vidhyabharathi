"use client";
// Vidyarthi (Student) dashboard — overview. Shell (brand + nav + language) is in
// layout.js; this page renders the welcome, live stats, and recent assignments.
import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";

export default function VidyarthiDashboard() {
  const [name, setName] = useState("Vidyarthi");
  const [stats, setStats] = useState({ assignments: 0, avg: null, chapters: 0 });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    apiGet("/students/current").then((d) => d?.student?.full_name && setName(d.student.full_name)).catch(() => {});
    apiGet("/assignments").then((d) => {
      if (Array.isArray(d)) { setAssignments(d.slice(0, 5)); setStats((s) => ({ ...s, assignments: d.length })); }
    }).catch(() => {});
    apiGet("/chapters").then((d) => Array.isArray(d) && setStats((s) => ({ ...s, chapters: d.length }))).catch(() => {});
    apiGet("/marks").then((d) => {
      if (Array.isArray(d) && d.length) {
        const pcts = d.map((m) => m.percentage).filter((x) => x != null);
        if (pcts.length) setStats((s) => ({ ...s, avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) + "%" }));
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="vb-card">
        <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}>
          <span className="dev">नमस्ते</span>, {name} <span style={{ color: "var(--saffron-deep)" }}>👋</span>
        </div>
        <p style={{ color: "#6F5B45", marginTop: 8 }}>
          Here's your learning at a glance — rooted in the five-fold Panchakosha vision.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16, marginTop: 16 }}>
        <Stat sk="कार्य" en="Assignments" value={stats.assignments} />
        <Stat sk="औसत अंक" en="Avg Score" value={stats.avg ?? "—"} />
        <Stat sk="अध्याय" en="Chapters" value={stats.chapters || "—"} />
      </div>

      <h2 style={{ fontFamily: "var(--serif)", marginTop: 28 }}>
        <span className="dev">आज का कार्य</span> <span style={{ color: "var(--muted)", fontSize: 16 }}>(Assignments)</span>
      </h2>
      <div className="vb-card" style={{ marginTop: 12, padding: 0 }}>
        {assignments.length === 0 ? (
          <div style={{ padding: 22, color: "var(--muted)" }}>No assignments yet.</div>
        ) : (
          assignments.map((a, i) => (
            <div key={a.assignment_id || i} style={{ padding: "16px 22px", borderTop: i ? "1px solid var(--line)" : "none", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>{a.title || "Assignment"}</span>
              <span style={{ color: "var(--muted)" }}>{a.due_date || ""}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function Stat({ sk, en, value }) {
  return (
    <div className="vb-card">
      <div style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--saffron-deep)" }}>{value}</div>
      <div style={{ marginTop: 4 }}><span className="dev" style={{ fontWeight: 700 }}>{sk}</span></div>
      <div style={{ color: "var(--muted)", fontSize: 13 }}>{en}</div>
    </div>
  );
}
