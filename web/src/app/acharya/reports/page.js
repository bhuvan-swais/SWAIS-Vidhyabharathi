"use client";

import { useState, useEffect } from "react";

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

/* ── helpers ─────────────────────────────────────── */
function getGrade(pct) {
  if (pct == null) return "—";
  if (pct >= 90) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  return "D";
}

const GRADE_COLOR = {
  "A+": { color: "#059669", bg: "#ECFDF5" },
  "A":  { color: "#10B981", bg: "#ECFDF5" },
  "B":  { color: "#EA580C", bg: "#FFF7ED" },
  "C":  { color: "#D97706", bg: "#FEF3C7" },
  "D":  { color: "#DC2626", bg: "#FEF2F2" },
  "—":  { color: "#9CA3AF", bg: "#F3F4F6" },
};

function gradeColor(pct) {
  if (pct == null) return "#9CA3AF";
  if (pct >= 90) return "#10B981";
  if (pct >= 75) return "#F59E0B";
  if (pct >= 60) return "#EA580C";
  if (pct >= 45) return "#C2410C";
  return "#DC2626";
}

/* ── PercentBar ──────────────────────────────────── */
function PercentBar({ value }) {
  const pct = value ?? 0;
  const gradient =
    pct >= 75 ? "linear-gradient(90deg,#10B981,#059669)" :
    pct >= 50 ? "linear-gradient(90deg,#F59E0B,#EA580C)" :
    pct >= 35 ? "linear-gradient(90deg,#EA580C,#C2410C)" :
                "linear-gradient(90deg,#EF4444,#9F1239)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100 shadow-inner">
        <div className="h-full rounded-full transition-all duration-700 shadow-sm" style={{ width: `${pct}%`, background: gradient }} />
      </div>
      <span className="text-[11px] font-extrabold w-10 text-right text-gray-500">
        {value != null ? `${value}%` : "—"}
      </span>
    </div>
  );
}

/* ── Donut chart (pure CSS/SVG) ──────────────────── */
function DonutChart({ pct, color, size = 120 }) {
  const r   = 46;
  const circ = 2 * Math.PI * r;
  const fill = ((pct ?? 0) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-sm">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="900" fill="#111827">{pct ?? 0}%</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9CA3AF" className="uppercase tracking-widest">avg score</text>
    </svg>
  );
}

/* ── AI Insights panel ───────────────────────────── */
function AIInsightsPanel({ text, onClose }) {
  return (
    <div className="rounded-2xl p-5 space-y-3 mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 shadow-sm font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-sm font-extrabold text-orange-700">कृत्रिममेधा-विश्लेषणम् (AI Insights)</span>
        </div>
        <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer bg-white text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200">
          Close
        </button>
      </div>
      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-gray-800">{text}</p>
    </div>
  );
}

/* ── StudentSpotlight ────────────────────────────── */
function StudentSpotlight({ student, totalAssessments, subject, onBack }) {
  const [aiText,      setAiText]      = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);

  const handleStudentAnalytics = async () => {
    setAiLoading(true);
    setAiText(null);
    try {
      const res = await fetch(`${API}/api/v1/analytics/student`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ studentName: student.name, subject }),
      });
      const data = await res.json();
      setAiText(data?.analysis || data?.message || JSON.stringify(data));
    } catch {
      setAiText("Failed to get AI analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const pct   = student.average_percent ?? 0;
  const grade = getGrade(pct);
  const gc    = GRADE_COLOR[grade] || GRADE_COLOR["—"];
  const color = gradeColor(pct);
  const initials = student.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  const stats = [
    { label: "Class Rank",    value: `#${student.rank}`,                               sub: `of ${totalAssessments > 0 ? "class" : "—"}` },
    { label: "Average Score", value: pct ? `${pct}%` : "—",                         sub: "overall" },
    { label: "Highest Marks", value: student.highest_marks ?? "—",                  sub: "best score" },
    { label: "Assessments",   value: `${student.total_assessed}/${totalAssessments}`, sub: "attempted" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6 border border-gray-100 shadow-md font-inter">

      {/* Back + title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer transition-all text-orange-600 bg-orange-50 hover:bg-orange-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          कक्षा विवरणम् (Class Overview)
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleStudentAnalytics} disabled={aiLoading}
            className={`flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer transition-all shadow-sm ${aiLoading ? "bg-orange-300 text-white" : "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700"}`}>
            {aiLoading ? "Analysing…" : "AI Analysis"}
          </button>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500">
            छात्रस्य विवरणम् (Student Spotlight)
          </span>
        </div>
      </div>
      
      {aiText && <AIInsightsPanel text={aiText} onClose={() => setAiText(null)} />}

      {/* Profile + donut */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
        <div className="shrink-0"><DonutChart pct={pct} color={color} size={130} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shrink-0 shadow-sm bg-gradient-to-br from-orange-500 to-amber-500">
              {initials}
            </div>
            <div>
              <p className="font-extrabold text-xl leading-tight text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>{student.name}</p>
              <p className="font-mono text-xs font-bold text-gray-400 mt-0.5">{student.roll_number}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 mb-4">
            <span className="px-3 py-1 rounded-md text-[11px] font-extrabold border"
              style={{ background: gc.bg, color: gc.color, borderColor: gc.color + "30" }}>Grade {grade}</span>
            <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
              Rank #{student.rank}
            </span>
          </div>
          <PercentBar value={pct} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center bg-white border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-400">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Grade band strip */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3 text-gray-400">Grade Bands</p>
        <div className="flex rounded-xl overflow-hidden text-center text-[10px] font-extrabold shadow-sm border border-gray-100">
          {[
            { label: "A+ ≥90%", color: "#10B981", active: pct >= 90 },
            { label: "A ≥75%",  color: "#34D399", active: pct >= 75 && pct < 90 },
            { label: "B ≥60%",  color: "#F59E0B", active: pct >= 60 && pct < 75 },
            { label: "C ≥45%",  color: "#EA580C", active: pct >= 45 && pct < 60 },
            { label: "D <45%",  color: "#EF4444", active: pct < 45 },
          ].map(b => (
            <div key={b.label} className="flex-1 py-2"
              style={{
                background: b.active ? b.color : `${b.color}15`,
                color: b.active ? "white" : b.color,
                transition: "all 0.3s",
              }}>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Podium config ───────────────────────────────── */
const PODIUM_CONFIG = [
  { medal: "🥇", ring: "4px solid #F59E0B", bg: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", textColor: "#D97706", size: "w-14 h-14", text: "text-2xl" },
  { medal: "🥈", ring: "3px solid #9CA3AF", bg: "linear-gradient(135deg,#F9FAFB,#F3F4F6)", textColor: "#6B7280", size: "w-12 h-12", text: "text-lg" },
  { medal: "🥉", ring: "3px solid #EA580C", bg: "linear-gradient(135deg,#FFF7ED,#FFEDD5)", textColor: "#C2410C", size: "w-10 h-10", text: "text-base" },
];

/* ── Main page ───────────────────────────────────── */
export default function ReportsPage() {
  const [report,          setReport]          = useState(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [search,          setSearch]          = useState("");
  const [sortBy,          setSortBy]          = useState("rank");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classAiText,     setClassAiText]     = useState(null);
  const [classAiLoading,  setClassAiLoading]  = useState(false);

  const subject = report?.subject || "";

  const handleClassAnalytics = async () => {
    setClassAiLoading(true);
    setClassAiText(null);
    try {
      const res = await fetch(`${API}/api/v1/analytics/class`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();
      setClassAiText(data?.analysis || data?.message || JSON.stringify(data));
    } catch {
      setClassAiText("Failed to get AI analysis. Please try again.");
    } finally {
      setClassAiLoading(false);
    }
  };

  useEffect(() => {
    const headers = getHeaders();
    if (!headers["Authorization"] || !headers["x-school-id"]) {
      setReport(null);
      setIsLoading(false);
      return;
    }
    fetch(`${API}/api/v1/reports`, { headers })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.detail || `Error ${r.status}`);
        }
        return r.json();
      })
      .then(d => setReport(d))
      .catch(() => {
        setReport(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const students = report?.students || [];
  const totalAssessments = report?.total_assessments || 0;

  const filtered = students
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.average_percent ?? 0) - (a.average_percent ?? 0);
    });

  const top3 = [...students].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const handleSelect = (s) => {
    setSelectedStudent(prev => prev?.student_id === s.student_id ? null : s);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-inter">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            प्रगतिः <span className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">(Reports)</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pl-12 gap-3">
          <p className="text-sm font-bold text-gray-500">
            {report?.class_name ? `Class ${report.class_name}` : ""}{report?.section ? ` — Section ${report.section}` : ""} &nbsp;·&nbsp;
            <span className="text-orange-600 font-extrabold">{report?.total_assessments || 0}</span> assessments ·{" "}
            <span className="text-orange-600 font-extrabold">{report?.total_students || 0}</span> students
          </p>
          <button onClick={handleClassAnalytics} disabled={classAiLoading}
            className={`flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer transition-all shrink-0 shadow-sm ${classAiLoading ? "bg-orange-300 text-white" : "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {classAiLoading ? "Analysing…" : "Class AI Analysis"}
          </button>
        </div>
        {classAiText && <div className="pl-12 mt-2"><AIInsightsPanel text={classAiText} onClose={() => setClassAiText(null)} /></div>}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-spin shadow-md" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading report…</p>
        </div>
      ) : (
        <>
          {/* ── Spotlight OR Podium ─────────────────────── */}
          {selectedStudent ? (
            <StudentSpotlight
              student={selectedStudent}
              totalAssessments={totalAssessments}
              subject={subject}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            top3.length >= 1 && (
              <div className="grid grid-cols-3 gap-6">
                {[1, 0, 2].map((origIdx, podiumPos) => {
                  const s = top3[origIdx];
                  if (!s) return <div key={podiumPos} />;
                  const cfg = PODIUM_CONFIG[origIdx];
                  return (
                    <button key={s.student_id}
                      onClick={() => handleSelect(s)}
                      className="flex flex-col items-center text-center p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:-translate-y-1"
                      style={{ background: cfg.bg, border: cfg.ring, boxShadow: origIdx === 0 ? "0 10px 30px rgba(245,158,11,0.15)" : "none" }}>
                      <span className={cfg.text + " mb-3 drop-shadow-sm"}>{cfg.medal}</span>
                      <div className={`${cfg.size} rounded-2xl flex items-center justify-center font-black text-white mb-3 shrink-0 shadow-md bg-gradient-to-br from-orange-500 to-amber-500`}>
                        {s.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <p className="text-sm font-extrabold leading-tight mb-1 text-gray-900">{s.name}</p>
                      <p className="text-[10px] font-mono font-bold mb-3 text-gray-500">{s.roll_number}</p>
                      <span className="px-3 py-1 rounded-lg text-xs font-black shadow-sm"
                        style={{ background: "white", color: cfg.textColor, border: `1px solid ${cfg.textColor}40` }}>
                        {s.average_percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* ── Controls ───────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student by name or roll…"
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl focus:outline-none transition-all border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 shadow-sm"
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-5 py-3 text-sm font-bold rounded-xl focus:outline-none transition-all border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 shadow-sm cursor-pointer bg-white">
              <option value="rank">Sort by Rank</option>
              <option value="avg">Sort by Average</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* ── Full Table ──────────────────────────────── */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {[
                      { label: "स्थानम् (Rank)",          cls: "text-center w-16" },
                      { label: "छात्रः (Student)",        cls: "text-left" },
                      { label: "मूल्याङ्कितम् (Assessed)", cls: "text-center" },
                      { label: "औसतम् (Avg Marks)",       cls: "text-right" },
                      { label: "अधिकतमम् (High)",         cls: "text-right w-16" },
                      { label: "न्यूनतमम् (Low)",          cls: "text-right w-16" },
                      { label: "प्रदर्शनम् (Performance)", cls: "w-48 text-left pl-6" },
                    ].map(h => (
                      <th key={h.label} className={`px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-orange-700 ${h.cls}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(s => {
                    const isTop3    = s.rank <= 3;
                    const isActive  = selectedStudent?.student_id === s.student_id;
                    return (
                      <tr key={s.student_id}
                        onClick={() => handleSelect(s)}
                        className={`cursor-pointer transition-colors ${isActive ? "bg-orange-50/50" : "hover:bg-orange-50/30"}`}
                        style={{ borderLeft: isActive ? "4px solid #EA580C" : "4px solid transparent" }}>

                        {/* Rank */}
                        <td className="px-4 py-4 text-center">
                          {isTop3 ? (
                            <span className="text-xl drop-shadow-sm">{"🥇🥈🥉"[s.rank - 1]}</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-black bg-gray-100 text-gray-500 border border-gray-200">
                              {s.rank}
                            </span>
                          )}
                        </td>

                        {/* Student */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                              style={{ background: isTop3 ? "linear-gradient(135deg,#F59E0B,#EF4444)" : "linear-gradient(135deg,#EA580C,#C2410C)" }}>
                              {s.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <p className={`font-extrabold transition-colors ${isActive ? "text-orange-600" : "text-gray-900"}`}>{s.name}</p>
                              <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">{s.roll_number}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center text-xs font-bold text-gray-500">{s.total_assessed}</td>
                        <td className="px-4 py-4 text-right font-black text-gray-900">
                          {s.average_marks != null ? s.average_marks : "—"}
                        </td>
                        <td className="px-4 py-4 text-right text-xs font-black text-emerald-600">
                          {s.highest_marks ?? "—"}
                        </td>
                        <td className="px-4 py-4 text-right text-xs font-black text-red-500">
                          {s.lowest_marks ?? "—"}
                        </td>
                        <td className="px-4 py-4 pl-6">
                          <PercentBar value={s.average_percent} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] font-bold text-right uppercase tracking-widest text-gray-400 px-1">
            Showing <span className="font-black text-orange-600">{filtered.length}</span> of {students.length} students
          </p>
        </>
      )}
    </div>
  );
}