"use client";

import { useState, useEffect, useMemo } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

function getHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("vb_acharya_token");
  const schoolId = localStorage.getItem("vb_school_id");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-school-id": schoolId
  };
}

const TYPE_CONFIG = {
  quiz:       { label: "प्रश्नोत्तरी (Quiz)",       bg: "#FFF7ED", color: "#C2410C", dot: "#EA580C" },
  test:       { label: "परीक्षा (Test)",           bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  exam:       { label: "मुख्यपरीक्षा (Exam)",       bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  assignment: { label: "गृहकार्यम् (Assignment)", bg: "#Fef3c7", color: "#B45309", dot: "#F59E0B" },
};

const GRADE_STYLE = {
  "A+": { color: "#059669", bg: "#ECFDF5", band: "#10B981" },
  "A":  { color: "#059669", bg: "#ECFDF5", band: "#34D399" },
  "B":  { color: "#EA580C", bg: "#FFF7ED", band: "#FB923C" },
  "C":  { color: "#D97706", bg: "#FEF3C7", band: "#FBBF24" },
  "D":  { color: "#DC2626", bg: "#FEF2F2", band: "#F87171" },
  "—":  { color: "#9CA3AF", bg: "#F3F4F6", band: "#CBD5E1" },
};

function getGrade(pct) {
  if (pct === null || pct === undefined) return "—";
  if (pct >= 90) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  return "D";
}

/* ── Distribution Bar ─────────────────────────────────────────── */
function DistBar({ dist, total }) {
  const order = ["A+", "A", "B", "C", "D"];
  const safeTotal = total || 1;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 shadow-inner">
      {order.map(g => {
        const count = dist[g] || 0;
        if (!count) return null;
        const pct = (count / safeTotal) * 100;
        return (
          <div key={g} title={`${g}: ${count}`}
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: GRADE_STYLE[g].band }} />
        );
      })}
    </div>
  );
}

/* ── Average Pill ─────────────────────────────────────────────── */
function AvgPill({ avg, max }) {
  if (avg == null) return <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No avg yet</span>;
  const pct = max ? Math.round((avg / max) * 100) : 0;
  const grade = getGrade(pct);
  const gs = GRADE_STYLE[grade];
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: gs.band }} />
      <span className="text-xs font-extrabold" style={{ color: gs.color }}>{avg} / {max}</span>
      <span className="text-[10px] font-bold" style={{ color: gs.color, opacity: 0.8 }}>· {pct}%</span>
    </div>
  );
}

/* ── Result Drawer (with star, at-risk, distribution) ─────────── */
function ResultDrawer({ assessment, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const headers = getHeaders();
    if (!headers["Authorization"]) {
      setDetail({ ...assessment, results: [] });
      setLoading(false);
      return;
    }
    fetch(`${API}/api/v1/assessments/${assessment.assessment_id}`, { headers })
      .then(async (r) => {
        if (!r.ok) {
          const b = await r.json().catch(() => ({}));
          throw new Error(b.detail || `Error ${r.status}`);
        }
        return r.json();
      })
      .then(setDetail)
      .catch(() => {
        setDetail({ ...assessment, results: [] });
      })
      .finally(() => setLoading(false));
  }, [assessment.assessment_id]);

  const cfg = TYPE_CONFIG[assessment.assessment_type] || TYPE_CONFIG.test;

  const { star, atRisk, dist, presentCount } = useMemo(() => {
    const results = detail?.results || [];
    const present = results.filter(r => r.marks_obtained != null);
    const sorted  = [...present].sort((a, b) => (b.marks_obtained ?? 0) - (a.marks_obtained ?? 0));
    const d = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
    present.forEach(r => {
      const g = getGrade(r.percentage);
      if (d[g] !== undefined) d[g]++;
    });
    return {
      star:   sorted[0] || null,
      atRisk: sorted[sorted.length - 1] || null,
      dist:   d,
      presentCount: present.length,
    };
  }, [detail]);

  return (
    <div className="fixed inset-0 z-50 flex font-inter">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-200"
        style={{ animation: "slideInRight 0.25s ease-out" }}>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold mb-2 uppercase tracking-widest border border-orange-100"
                style={{ background: cfg.bg, color: cfg.color }}>
                <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: cfg.dot }} />
                {cfg.label}
              </span>
              <h2 className="text-xl font-extrabold leading-snug text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {assessment.title}
              </h2>
              {assessment.chapter && (
                <p className="text-xs font-bold mt-1 text-gray-400 uppercase tracking-wide">{assessment.chapter}</p>
              )}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg cursor-pointer transition-all text-gray-400 hover:bg-red-50 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "Max Marks", value: assessment.max_marks },
              { label: "Submitted", value: `${assessment.submitted}/${assessment.total_students}` },
              { label: "Avg Score", value: assessment.class_average ?? "—", highlight: true },
            ].map(m => (
              <div key={m.label} className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border shadow-sm"
                style={{
                  background: m.highlight ? "#FFF7ED" : "#F9FAFB",
                  borderColor: m.highlight ? "#FED7AA" : "#E5E7EB",
                }}>
                <span className="text-gray-500">{m.label}: </span>
                <span className="font-black" style={{ color: m.highlight ? "#EA580C" : "#111827" }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-4 animate-spin shadow-md" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading results…</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm font-bold text-red-500 bg-red-50">{error}</div>
          ) : (
            <>
              {/* Star + At-risk strip */}
              {presentCount > 0 && (
                <div className="px-5 pt-5 pb-3 grid grid-cols-2 gap-4">
                  {star && (
                    <div className="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-orange-600">
                        ⭐ उत्कृष्टः (Star)
                      </p>
                      <p className="text-sm font-black leading-tight text-gray-900 mt-1">{star.student_name}</p>
                      <p className="text-xs font-bold mt-1 text-orange-800">
                        {star.marks_obtained}/{assessment.max_marks} · {star.percentage}%
                      </p>
                    </div>
                  )}
                  {atRisk && atRisk.result_id !== star?.result_id && (
                    <div className="rounded-xl p-4 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-red-600">
                        ⚠️ ध्यानम् आवश्यकम् (Risk)
                      </p>
                      <p className="text-sm font-black leading-tight text-gray-900 mt-1">{atRisk.student_name}</p>
                      <p className="text-xs font-bold mt-1 text-red-800">
                        {atRisk.marks_obtained}/{assessment.max_marks} · {atRisk.percentage}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Distribution */}
              {presentCount > 0 && (
                <div className="px-5 pb-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3 text-gray-500">
                      श्रेणी वितरणम् (Grade Distribution)
                    </p>
                    <DistBar dist={dist} total={presentCount} />
                    <div className="flex flex-wrap gap-4 mt-3 justify-center">
                      {["A+", "A", "B", "C", "D"].map(g => (
                        <div key={g} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-md shadow-sm" style={{ background: GRADE_STYLE[g].band }} />
                          <span className="text-[11px] font-extrabold text-gray-600">
                            {g} <span className="text-gray-400 font-bold ml-0.5">({dist[g] || 0})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Results table */}
              <table className="w-full text-sm bg-white">
                <thead className="sticky top-0 bg-white border-y border-gray-200 shadow-sm z-10">
                  <tr>
                    {["Roll", "Name", "Marks", "%", "Grade"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[10px] font-extrabold uppercase tracking-widest ${i >= 2 ? "text-right" : "text-left"} ${i === 4 ? "text-center" : ""}`}
                        style={{ color: "#EA580C" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detail?.results?.map((r) => {
                    const grade = getGrade(r.percentage);
                    const gs = GRADE_STYLE[grade];
                    const isStar    = star?.result_id   === r.result_id;
                    const isAtRisk  = atRisk?.result_id === r.result_id && !isStar;
                    return (
                      <tr key={r.result_id}
                        className={`transition-colors ${isStar ? "bg-amber-50/50" : isAtRisk ? "bg-red-50/50" : "hover:bg-orange-50/30"}`}>
                        <td className="px-5 py-3 font-mono text-[11px] font-bold text-gray-400">{r.roll_number}</td>
                        <td className="px-5 py-3 font-extrabold text-gray-900">
                          <span className="inline-flex items-center gap-1.5">
                            {isStar   && <span title="Star performer">⭐</span>}
                            {isAtRisk && <span title="Needs attention">⚠️</span>}
                            {r.student_name}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {r.marks_obtained !== null
                            ? <span className="font-black text-gray-900">{r.marks_obtained}</span>
                            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-red-50 text-red-600 border border-red-100">Absent</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-[11px] font-bold text-gray-500">
                          {r.percentage !== null ? `${r.percentage}%` : "—"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold border"
                            style={{ background: gs.bg, color: gs.color, borderColor: gs.color + "30" }}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function AssessmentsPage() {
  const [assessments,    setAssessments]    = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState(null);
  const [selected,       setSelected]       = useState(null);
  const [typeFilter,     setTypeFilter]     = useState("all");
  const [subjectFilter,  setSubjectFilter]  = useState("all");

  useEffect(() => {
    const headers = getHeaders();
    if (!headers["Authorization"] || !headers["x-school-id"]) {
      setAssessments([]);
      setIsLoading(false);
      return;
    }
    fetch(`${API}/api/v1/assessments`, { headers })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.detail || `Error ${r.status}`);
        }
        return r.json();
      })
      .then(d => setAssessments(d.assessments || []))
      .catch((err) => {
        setAssessments([]);
        setError(err?.message || "Unable to load assessments.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const typeCounts = useMemo(() => {
    const c = { all: assessments.length, quiz: 0, test: 0, exam: 0, assignment: 0 };
    assessments.forEach(a => { c[a.assessment_type] = (c[a.assessment_type] || 0) + 1; });
    return c;
  }, [assessments]);

  const subjects = useMemo(() => {
    const s = [...new Set(assessments.map(a => a.subject).filter(Boolean))].sort();
    return s;
  }, [assessments]);

  const filtered = useMemo(() => {
    return assessments.filter(a => {
      const typeMatch    = typeFilter    === "all" || a.assessment_type === typeFilter;
      const subjectMatch = subjectFilter === "all" || a.subject === subjectFilter;
      return typeMatch && subjectMatch;
    });
  }, [assessments, typeFilter, subjectFilter]);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-inter">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                मूल्यांकनम् <span className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">(Assessments)</span>
              </h1>
            </div>
            <p className="text-sm pl-12 font-bold text-gray-500">
              <span className="text-orange-600 font-extrabold">{assessments.length}</span> assessments · Click any card to view results
            </p>
          </div>
        </div>

        {/* ── Summary Stat Strip ────────────────────────────── */}
        {!isLoading && !error && assessments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: "quiz",       icon: "📝", label: "Quizzes" },
              { type: "test",       icon: "📋", label: "Tests" },
              { type: "exam",       icon: "🎯", label: "Exams" },
              { type: "assignment", icon: "📚", label: "Assignments" },
            ].map(s => {
              const cfg = TYPE_CONFIG[s.type];
              const count = typeCounts[s.type] || 0;
              return (
                <div key={s.type} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl drop-shadow-sm">{s.icon}</span>
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: cfg.dot }} />
                  </div>
                  <p className="text-3xl font-black text-gray-900 leading-none">{count}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Filters Row ───────────────────────────────────── */}
        {!isLoading && !error && assessments.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { value: "all",        label: "सर्वाणि (All)",   color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
                { value: "quiz",       label: TYPE_CONFIG.quiz.label,       color: TYPE_CONFIG.quiz.color,       bg: TYPE_CONFIG.quiz.bg,       border: "#FED7AA" },
                { value: "test",       label: TYPE_CONFIG.test.label,       color: TYPE_CONFIG.test.color,       bg: TYPE_CONFIG.test.bg,       border: "#FDE68A" },
                { value: "exam",       label: TYPE_CONFIG.exam.label,       color: TYPE_CONFIG.exam.color,       bg: TYPE_CONFIG.exam.bg,       border: "#FECACA" },
                { value: "assignment", label: TYPE_CONFIG.assignment.label, color: TYPE_CONFIG.assignment.color, bg: TYPE_CONFIG.assignment.bg, border: "#FDE68A" },
              ].map(c => {
                const isActive = typeFilter === c.value;
                const count = typeCounts[c.value] || 0;
                return (
                  <button key={c.value}
                    onClick={() => setTypeFilter(c.value)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all border shadow-sm"
                    style={{
                      background: isActive ? c.color : c.bg,
                      color:      isActive ? "white" : c.color,
                      borderColor: isActive ? c.color : c.border,
                    }}>
                    {c.label} <span className="opacity-70 font-medium ml-1">· {count}</span>
                  </button>
                );
              })}
            </div>

            {/* Subject filter */}
            {subjects.length > 1 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">विषयः (Subject):</span>
                {["all", ...subjects].map(s => {
                  const isActive = subjectFilter === s;
                  return (
                    <button key={s}
                      onClick={() => setSubjectFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                        isActive ? "bg-orange-600 text-white border-orange-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      }`}>
                      {s === "all" ? "All Subjects" : s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Cards ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-5 w-24 mb-4 rounded-md bg-gray-100" />
                <div className="h-4 w-3/4 mb-3 bg-gray-50 rounded" />
                <div className="h-3 w-1/2 mb-5 bg-gray-50 rounded" />
                <div className="h-2 w-full rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-8 text-center text-sm font-bold border border-red-200 text-red-600 shadow-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100 shadow-inner">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No assessments found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => {
              const cfg = TYPE_CONFIG[a.assessment_type] || TYPE_CONFIG.test;
              const submittedPct = a.total_students
                ? Math.round((a.submitted / a.total_students) * 100)
                : 0;
              const avgPct = (a.class_average != null && a.max_marks)
                ? Math.round((a.class_average / a.max_marks) * 100)
                : null;
              const grade = getGrade(avgPct);
              const gs = GRADE_STYLE[grade];

              return (
                <button
                  key={a.assessment_id}
                  onClick={() => setSelected(a)}
                  className="bg-white rounded-2xl p-6 text-left group transition-all duration-300 cursor-pointer border border-gray-100 shadow-sm flex flex-col h-full hover:border-orange-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest border"
                      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + "30" }}>
                      <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(a.assessment_date)}</span>
                  </div>

                  <h3 className="text-base font-extrabold leading-snug mb-2 text-gray-900 group-hover:text-orange-600 transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {a.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {a.subject && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {a.subject}
                      </span>
                    )}
                    {a.chapter && (
                      <p className="text-[11px] font-bold truncate text-gray-400 uppercase tracking-wide">{a.chapter}</p>
                    )}
                  </div>

                  <div className="mt-auto space-y-4">
                    {/* Submission progress */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1 font-bold text-gray-500 uppercase tracking-wide">
                        <span>Submitted</span>
                        <span>{a.submitted}/{a.total_students} · {submittedPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                        <div className="h-full rounded-full transition-all bg-gradient-to-r from-orange-500 to-amber-500"
                          style={{ width: `${submittedPct}%` }} />
                      </div>
                    </div>

                    {/* Performance band */}
                    {avgPct != null && (
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-bold text-gray-500 uppercase tracking-wide">
                          <span>Class Perf.</span>
                          <span style={{ color: gs.color, fontWeight: 900 }}>Grade {grade}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                          <div className="h-full rounded-full transition-all shadow-sm"
                            style={{
                              width: `${avgPct}%`,
                              background: `linear-gradient(90deg, ${gs.band}, ${gs.color})`,
                            }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Max: <strong className="text-gray-900 font-black">{a.max_marks}</strong>
                      </span>
                      <AvgPill avg={a.class_average} max={a.max_marks} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && <ResultDrawer assessment={selected} onClose={() => setSelected(null)} />}
    </>
  );
}