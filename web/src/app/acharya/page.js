"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const TODAY = new Date();

function getDueDays(dueDateStr) {
  const due = new Date(dueDateStr);
  const diff = Math.round((due - TODAY) / (1000 * 60 * 60 * 24));
  return diff;
}

function DueLabel({ days }) {
  if (days < 0)  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#EF4444" }}>Overdue</span>;
  if (days === 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#EA580C" }}>Due Today</span>;
  if (days === 1) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>Due Tomorrow</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#64748B" }}>In {days} days</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes, isLoading: notesLoading } = useNotes();
  const [assignments, setAssignments] = useState([]);
  
  const [apiStats, setApiStats] = useState({
    total_students: 0,
    total_notes: 0,
    chapters_covered: 0,
    pending_panchakosha: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("vb_acharya_token");
    const schoolId = localStorage.getItem("vb_school_id");
    if (!token || !schoolId) return;

    const headers = { 
      Authorization: `Bearer ${token}`,
      "x-school-id": schoolId
    };

    fetch(`${API}/api/v1/assignments`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setAssignments((d.assignments || []).map(a => ({
        id: a.assignment_id,
        title: a.title,
        subject: a.subject,
        dueDate: a.due_date,
        submittedCount: a.submitted_count,
        totalStudents: a.total_students,
      }))))
      .catch(() => setAssignments([]));

    fetch(`${API}/api/v1/acharya/dashboard-stats`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setApiStats(d))
      .catch(console.error);
      
  }, []);

  const recentNotes = notes.slice(0, 3);
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const stats = [
    {
      label: "टिप्पण्यः (Notes)",
      value: apiStats.total_notes,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      gradient: "linear-gradient(135deg,#3B82F6,#2563EB)",
      bg: "#EFF6FF",
      text: "#2563EB",
    },
    {
      label: "छात्राः (Students)",
      value: apiStats.total_students || "—",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
      gradient: "linear-gradient(135deg,#10B981,#059669)",
      bg: "#ECFDF5",
      text: "#10B981",
    },
    {
      label: "पाठाः (Chapters)",
      value: apiStats.chapters_covered,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      gradient: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
      bg: "#F5F3FF",
      text: "#8B5CF6",
    },
    {
      label: "पञ्चकोशः (Panchakosha)",
      value: `${apiStats.pending_panchakosha} Pending`,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      gradient: "linear-gradient(135deg,#EA580C,#C2410C)",
      bg: "#FFF7ED",
      text: "#EA580C",
    },
  ];

  const quickActions = [
    {
      href: "/acharya/panchakosha",
      label: "पञ्चकोश मूल्यांकनम्",
      desc: "Record Holistic Evidence",
      gradient: "linear-gradient(135deg,#EA580C,#C2410C)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      href: "/acharya/classes",
      label: "छात्राः (Students)",
      desc: "Class roster & parents",
      gradient: "linear-gradient(135deg,#10B981,#059669)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
    },
    {
      href: "/acharya/notes",
      label: "टिप्पणी निर्माणम् (Notes)",
      desc: "Add new study material",
      gradient: "linear-gradient(135deg,#3B82F6,#2563EB)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      href: "/acharya/assessments",
      label: "मूल्यांकनम् (Assessments)",
      desc: "Tests & quiz results",
      gradient: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-inter">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <div
        className="relative w-full rounded-2xl p-7 sm:p-10 text-white overflow-hidden shadow-xl"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      >
        
        {/* Dual Language Text Watermark */}
        <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 flex flex-col items-end text-right text-white opacity-[0.15] select-none pointer-events-none">
          <div className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-1 md:mb-2 whitespace-nowrap">
            सा विद्या या विमुक्तये
          </div>
          <div className="text-sm sm:text-lg md:text-xl font-bold tracking-widest uppercase whitespace-nowrap">
            Knowledge is that which liberates
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-start w-full md:w-2/3">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            VidhyaBharathi AI Classroom
          </div>
          
          <p className="text-white/90 text-base mb-1 font-medium tracking-wide">Welcome back,</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-5 text-white drop-shadow-md tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            नमस्ते, {user?.full_name || user?.name || user?.username || "आचार्य"} जी 🙏
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <svg className="w-4 h-4 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-white text-sm font-semibold tracking-wide">
              {user?.class ? `Class ${user.class}${user?.section ? ` - Section ${user.section}` : ""}` : "All Classes"}
              {user?.subject ? ` · ${user.subject}` : ""} 
            </p>
          </div>
          
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ background: stat.gradient }}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {stat.value}
            </p>
            <p className="text-xs font-bold text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Content Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Notes */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                नवीनतम टिप्पण्यः (Recent Notes)
              </h2>
            </div>
            <Link href="/acharya/notes"
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
              View All →
            </Link>
          </div>

          {notesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 animate-pulse h-16" />
              ))}
            </div>
          ) : recentNotes.length > 0 ? (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link key={note.id} href="/acharya/notes"
                  className="flex items-start justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{note.chapter}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 shrink-0">
                    {formatDate(note.updatedAt)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-center py-8 text-gray-400">
              No notes yet. Create your first note!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r from-orange-500 to-amber-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              त्वरित कार्याणि (Quick Actions)
            </h2>
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: action.gradient }}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{action.label}</p>
                  <p className="text-[11px] font-bold text-gray-500">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 ml-auto text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assignment Alerts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Due Date Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
          <div className="flex items-center gap-2 mb-5 ml-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-red-500 to-rose-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                अन्तिम तिथिः (Due Dates)
              </h2>
            </div>
            {assignments.filter(a => getDueDays(a.dueDate) <= 1).length > 0 && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 animate-pulse border border-red-200">
                {assignments.filter(a => getDueDays(a.dueDate) <= 1).length} urgent
              </span>
            )}
          </div>
          <div className="space-y-2.5 ml-2">
            {assignments.length === 0 && (
              <p className="text-sm font-medium text-center py-6 text-gray-400">No upcoming assignments.</p>
            )}
            {[...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(a => {
              const days = getDueDays(a.dueDate);
              const isUrgent = days <= 1;
              return (
                <div key={a.id}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border ${isUrgent ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{a.subject} · {new Date(a.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <DueLabel days={days} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
          <div className="flex items-center gap-2 mb-5 ml-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                प्रस्तुतिः (Submissions)
              </h2>
            </div>
          </div>
          <div className="space-y-2.5 ml-2">
            {assignments.length === 0 && (
              <p className="text-sm font-medium text-center py-6 text-gray-400">No submission data yet.</p>
            )}
            {assignments.map(a => {
              const pct = Math.round((a.submittedCount / a.totalStudents) * 100) || 0;
              const allDone = a.submittedCount === a.totalStudents;
              const pendingCount = a.totalStudents - a.submittedCount;
              return (
                <div key={a.id} className="p-3.5 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{a.title}</p>
                    {allDone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0 ml-2">All Submitted ✓</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 shrink-0 ml-2">{pendingCount} pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: allDone ? "#10B981" : "linear-gradient(90deg,#F59E0B,#EA580C)" }} />
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${allDone ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {a.submittedCount}/{a.totalStudents}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}