"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

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

const GENDER_STYLE = {
  male:   { bg: "#FFF7ED", color: "#EA580C" },
  female: { bg: "#FEF2F2", color: "#E11D48" },
  other:  { bg: "#F3F4F6", color: "#6B7280" },
};

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
  "A":  { color: "#059669", bg: "#ECFDF5" },
  "B":  { color: "#EA580C", bg: "#FFF7ED" },
  "C":  { color: "#D97706", bg: "#FEF3C7" },
  "D":  { color: "#DC2626", bg: "#FEF2F2" },
  "—":  { color: "#9CA3AF", bg: "#F3F4F6" },
};

function PercentBar({ value }) {
  const pct = value ?? 0;
  const gradient =
    pct >= 75 ? "linear-gradient(90deg,#10B981,#059669)" :
    pct >= 50 ? "linear-gradient(90deg,#F59E0B,#EA580C)" :
    pct >= 35 ? "linear-gradient(90deg,#EA580C,#E11D48)" :
                "linear-gradient(90deg,#EF4444,#9F1239)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all duration-700 shadow-sm"
          style={{ width: `${pct}%`, background: gradient }} />
      </div>
      <span className="text-[11px] font-extrabold w-10 text-right text-gray-500">
        {value != null ? `${value}%` : "—"}
      </span>
    </div>
  );
}

/* ─── Notify Parent Modal ──────────────────────────────────────────── */
function NotifyModal({ student, onClose }) {
  const [msgType, setMsgType] = useState("performance");
  const [message, setMessage] = useState("");
  const [sent,    setSent]    = useState(false);

  const TYPES = [
    { value: "performance",  label: "📊 Performance" },
    { value: "homework",     label: "📚 Homework" },
    { value: "attendance",   label: "📅 Attendance" },
    { value: "panchakosha",  label: "🧘 Panchakosha" },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden font-inter border border-gray-100">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

        <div className="px-6 py-5">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 border border-emerald-100">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold mb-1 text-gray-900">सूचना प्रेषिता (Sent!)</h3>
              <p className="text-sm font-medium text-gray-500">
                Parent of <span className="font-extrabold text-orange-600">{student.full_name}</span> has been notified.
              </p>
              <button onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-bold w-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                सम्पन्नम् (Done)
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    अभिभावकम् सूचयतु <span className="text-[11px] font-bold text-gray-400 uppercase ml-1">(Inform Parent)</span>
                  </h2>
                  <p className="text-xs font-bold mt-1 text-gray-500">
                    {student.full_name} &nbsp;·&nbsp;
                    <span className="font-mono text-orange-600">{student.guardian_phone || "No phone"}</span>
                  </p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs font-extrabold text-gray-700 mb-2">Notification Type</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {TYPES.map(t => (
                  <button key={t.value} onClick={() => setMsgType(t.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      msgType === t.value 
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" 
                        : "border-gray-200 bg-white text-gray-500 hover:border-orange-300"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <p className="text-xs font-extrabold text-gray-700 mb-2">सन्देशः (Message)</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder={`Write your message to ${student.guardian_name || "the parent"}…`}
                className="w-full px-4 py-3 text-sm font-medium text-gray-900 rounded-xl resize-none outline-none border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all shadow-sm"
              />

              <div className="flex gap-2 mt-5">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  निरस्त (Cancel)
                </button>
                <button onClick={handleSend} disabled={!message.trim()}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-sm ${
                    message.trim() ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}>
                  प्रेषयतु (Send)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Assign Homework Modal ──────────────────────── */
function AssignModal({ students, onClose, onSuccess }) {
  const isBulk = students.length > 1;
  const [title,   setTitle]   = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc,    setDesc]    = useState("");
  const [done,    setDone]    = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`${API}/api/v1/subjects`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSubjects(d.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  const handleAssign = async () => {
    if (!title.trim() || !dueDate || saving) return;
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch(`${API}/api/v1/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          text: desc || null,
          subject_id: subject ? Number(subject) : null,
          due_date: dueDate,
          student_ids: students.map(s => s.student_id)
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      if (onSuccess) onSuccess();
    } catch {
      setError("Couldn't create the assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col font-inter border border-gray-100">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <div className="px-6 py-5 overflow-y-auto">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-50 text-orange-600 border border-orange-100">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold mb-1 text-gray-900">Assignment Created!</h3>
              <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-xl text-sm font-bold w-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                सम्पन्नम् (Done)
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {isBulk ? "गृहकार्यम् (Bulk Assign)" : "गृहकार्यम् (Assign Homework)"}
                  </h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold mb-1.5 text-gray-700">Assignment Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 Questions"
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold mb-1.5 text-gray-700">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-900 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none bg-white shadow-sm cursor-pointer">
                      <option value="">-- Select --</option>
                      {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold mb-1.5 text-gray-700">Due Date *</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-900 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold mb-1.5 text-gray-700">Description / Instructions</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none shadow-sm" />
                </div>
                {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                
                <button onClick={handleAssign} disabled={!title.trim() || !dueDate || saving}
                  className={`w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all mt-4 shadow-sm ${
                    (title.trim() && dueDate && !saving) ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}>
                  {saving ? "Assigning…" : "नियोजयतु (Assign)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Student Detail Drawer ────────────────────────────────────────── */
function StudentDrawer({ student, perf, onNotify, onAssign, onClose }) {
  const gStyle   = GENDER_STYLE[(student.gender || "other").toLowerCase()] || GENDER_STYLE.other;
  const grade    = getGrade(perf?.average_percent);
  const gc       = GRADE_COLOR[grade] || GRADE_COLOR["—"];
  const initials = (student.full_name || "").split(" ").map(w => w[0]).slice(0, 2).join("");

  return (
    <div className="fixed inset-0 z-40 flex font-inter">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200"
        style={{ animation: "slideInRight 0.25s ease-out" }}>
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shrink-0 shadow-sm bg-gradient-to-br from-orange-500 to-amber-500">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {student.full_name}
                </h2>
                <p className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest">{student.roll_no}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {student.gender && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold capitalize border"
                      style={{ background: gStyle.bg, color: gStyle.color, borderColor: gStyle.color + "20" }}>{student.gender}</span>
                  )}
                  {grade !== "—" && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold border"
                      style={{ background: gc.bg, color: gc.color, borderColor: gc.color + "20" }}>Grade {grade}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => { onClose(); onNotify(student); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition-colors shadow-sm">
              सूचयतु (Notify)
            </button>
            <button onClick={() => { onClose(); onAssign(student); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors shadow-sm">
              गृहकार्यम् (Assign)
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {perf ? (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3 text-gray-400">
                प्रदर्शनम् (Performance)
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "🏆 Rank",    value: `#${perf.rank}` },
                  { label: "📊 Average", value: perf.average_percent != null ? `${perf.average_percent}%` : "—" },
                  { label: "⬆️ Highest", value: perf.highest_marks ?? "—" },
                  { label: "⬇️ Lowest",  value: perf.lowest_marks  ?? "—" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 border border-gray-100 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">{s.label}</p>
                    <p className="text-lg font-black text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between text-[11px] mb-2 text-gray-500 font-bold uppercase tracking-wide">
                  <span>Overall Percent</span>
                  <span>{perf.total_assessed} assessments</span>
                </div>
                <PercentBar value={perf.average_percent} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center text-sm bg-gray-50 text-gray-500 border border-gray-100 font-bold">
              No assessment data yet
            </div>
          )}

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3 text-gray-400">
              अभिभावकः (Parent / Guardian)
            </p>
            <div className="rounded-xl p-4 space-y-4 border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">नाम (Name)</p>
                  <p className="text-sm font-extrabold text-gray-900">{student.guardian_name || "—"}</p>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">दूरभाषः (Phone)</p>
                  <p className="text-sm font-mono font-extrabold text-gray-900">{student.guardian_phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function AcharyaClassesPage() {
  const { user } = useAuth();
  const [students,         setStudents]       = useState([]);
  const [reportMap,        setReportMap]      = useState({});
  const [isLoading,        setIsLoading]      = useState(true);
  const [error,            setError]          = useState(null);
  const [search,           setSearch]         = useState("");
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [notifyStudent, setNotifyStudent] = useState(null);
  const [assignStudent, setAssignStudent] = useState(null);
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [bulkAssignOpen,setBulkAssignOpen]= useState(false);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  useEffect(() => {
    const headers = getHeaders();
    if (!headers["Authorization"] || !headers["x-school-id"]) {
      setError("Session expired or missing School context. Please log out and log in again.");
      setIsLoading(false);
      return;
    }

    const safeFetch = (url) =>
      fetch(url, { headers }).then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.detail || `Error ${r.status}`);
        }
        return r.json();
      });

    Promise.all([
      safeFetch(`${API}/api/v1/students`),
      safeFetch(`${API}/api/v1/reports`),
    ])
      .then(([sd, rd]) => {
        setStudents(sd.students || []);
        const map = {};
        (rd.students || []).forEach(s => { map[s.student_id] = s; });
        setReportMap(map);
      })
      .catch((err) => {
        setStudents([]);
        setReportMap({});
        setError(err?.message || "Unable to load students. Ensure backend is running.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = students.filter(s =>
    (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.guardian_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-inter">

        {/* ── Dual-Language Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                कक्षाः <span className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">(Classes)</span>
              </h1>
            </div>
            <p className="text-sm pl-12 font-bold text-gray-500">
              {user?.class ? `Class ${user.class}` : ""}{user?.section ? ` — Section ${user.section}` : ""} &nbsp;·&nbsp;
              <span className="text-orange-600 font-extrabold">{students.length}</span> students enrolled
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, roll or parent…"
              className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse bg-orange-100 border border-orange-200" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading roster…</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-sm font-extrabold text-red-600 bg-red-50">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(s => selectedIds.has(s.student_id))}
                        ref={el => {
                          if (el) {
                            const someSelected = filtered.some(s => selectedIds.has(s.student_id));
                            const allSelected  = filtered.length > 0 && filtered.every(s => selectedIds.has(s.student_id));
                            el.indeterminate = someSelected && !allSelected;
                          }
                        }}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filtered.map(s => s.student_id)));
                          else clearSelection();
                        }}
                        className="w-4 h-4 cursor-pointer accent-orange-600"
                      />
                    </th>
                    {[
                      "अनुक्रमाङ्कः (Roll)", 
                      "नाम (Name)", 
                      "लिङ्गम् (Gender)", 
                      "अभिभावकः (Parent)", 
                      "दूरभाषः (Phone)", 
                      "औसतम् (Avg %)", 
                      "श्रेणी (Grade)", 
                      "कार्याणि (Actions)"
                    ].map((h, i) => (
                      <th key={h} className={`px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 ${i===1?"text-left":"text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s, i) => {
                    const gStyle = GENDER_STYLE[(s.gender || "other").toLowerCase()] || GENDER_STYLE.other;
                    const perf   = reportMap[s.student_id];
                    const grade  = getGrade(perf?.average_percent);
                    const gc     = GRADE_COLOR[grade] || GRADE_COLOR["—"];
                    const isChecked = selectedIds.has(s.student_id);
                    
                    return (
                      <tr key={s.student_id}
                        className={`transition-colors hover:bg-orange-50/40 ${isChecked ? "bg-orange-50/80" : "bg-white"}`}>

                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(s.student_id)}
                            className="w-4 h-4 cursor-pointer accent-orange-600" />
                        </td>

                        <td className="px-4 py-4 text-center font-mono text-[11px] font-extrabold text-gray-400 tracking-wider">
                          {s.roll_no}
                        </td>

                        <td className="px-4 py-4">
                          <button onClick={() => setDrawerStudent(s)} className="flex items-center gap-3 cursor-pointer group text-left">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                              style={{ background: `linear-gradient(135deg,${i % 2 === 0 ? "#EA580C,#F97316" : "#F59E0B,#EA580C"})` }}>
                              {(s.full_name || "").split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </div>
                            <span className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">{s.full_name}</span>
                          </button>
                        </td>

                        <td className="px-4 py-4 text-center">
                          {s.gender && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold capitalize border"
                              style={{ background: gStyle.bg, color: gStyle.color, borderColor: gStyle.color + "30" }}>{s.gender}</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-gray-600">{s.guardian_name || "—"}</td>
                        <td className="px-4 py-4 text-center font-mono text-xs font-extrabold text-gray-500">{s.guardian_phone || "—"}</td>

                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-black text-gray-900">
                            {perf?.average_percent != null ? `${perf.average_percent}%` : "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold border"
                            style={{ background: gc.bg, color: gc.color, borderColor: gc.color + "30" }}>{grade}</span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={e => { e.stopPropagation(); setNotifyStudent(s); }} title="Inform Parent"
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-orange-100 hover:text-orange-600 transition-colors border border-gray-100 hover:border-orange-200">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </button>
                            <button onClick={e => { e.stopPropagation(); setAssignStudent(s); }} title="Assign Homework"
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-amber-100 hover:text-amber-600 transition-colors border border-gray-100 hover:border-amber-200">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm font-bold text-gray-400 bg-gray-50">
                        कापि छात्रा न प्राप्ता (No students found)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isLoading && !error && (
          <p className="text-[11px] text-right font-bold text-gray-400 uppercase tracking-widest px-1">
            Showing <span className="text-orange-600">{filtered.length}</span> of {students.length} students
          </p>
        )}
      </div>

      {/* ── Modals & Drawer ── */}
      {drawerStudent && (
        <StudentDrawer student={drawerStudent} perf={reportMap[drawerStudent.student_id]}
          onNotify={setNotifyStudent} onAssign={setAssignStudent} onClose={() => setDrawerStudent(null)} />
      )}
      {notifyStudent && (
        <NotifyModal student={notifyStudent} onClose={() => setNotifyStudent(null)} />
      )}
      {assignStudent && (
        <AssignModal students={[assignStudent]} onClose={() => setAssignStudent(null)} onSuccess={() => setAssignStudent(null)} />
      )}
      {bulkAssignOpen && (
        <AssignModal students={students.filter(s => selectedIds.has(s.student_id))}
          onClose={() => setBulkAssignOpen(false)} onSuccess={() => { setBulkAssignOpen(false); clearSelection(); }} />
      )}

      {/* ── Floating selection bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(234,88,12,0.2)] bg-white border border-gray-200 font-inter"
          style={{ animation: "slideUp 0.25s ease-out" }}>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm">
              {selectedIds.size}
            </span>
            <span className="text-sm font-bold text-gray-700">
              student{selectedIds.size === 1 ? "" : "s"} selected
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button onClick={clearSelection} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider">
            Clear
          </button>
          <button onClick={() => setBulkAssignOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-colors ml-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            गृहकार्यम् (Bulk Assign)
          </button>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
    </>
  );
}