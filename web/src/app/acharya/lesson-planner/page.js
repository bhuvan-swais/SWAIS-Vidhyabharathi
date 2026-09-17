"use client";

import { useState, useEffect, useRef } from "react";
import ChapterPicker from "@/components/chapters/ChapterPicker";

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

/* ── Typing animation hook ──────────────────────────────────────────── */
function useTypewriter(text, speed = 18, active = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) { setDisplayed(text || ""); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);
  return displayed;
}

/* ── AI Generating animation ────────────────────────────────────────── */
function GeneratingAnimation() {
  const steps = [
    "Analysing chapter content…",
    "Structuring learning objectives…",
    "Designing activity flow…",
    "Crafting assessment strategy…",
    "Finalising lesson plan…",
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }, 280);
    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 95));
    }, 30);
    return () => { clearInterval(stepInterval); clearInterval(progInterval); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[420px] px-8">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 animate-pulse flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 0 40px rgba(234,88,12,0.4)" }}>
          <svg className="w-9 h-9 text-white animate-spin" style={{ animationDuration: "3s" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-500" />
      </div>

      <h3 className="text-lg font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        AI is crafting your lesson plan
      </h3>
      <p className="text-sm font-bold text-gray-500 mb-6 text-center">
        {steps[step]}
      </p>

      <div className="w-full max-w-xs">
        <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
          <div className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((_, i) => (
            <div key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "#EA580C" : "#F3F4F6" }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs mt-8 space-y-2.5">
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className="h-3 rounded bg-gray-100 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Printable lesson-plan form ───────────────────────────────────────── */
const FORM_SECTIONS = [
  ["objectives",  "Learning objectives"],
  ["outcomes",    "Learning outcomes"],
  ["methodology", "Methodology"],
  ["tlm",         "TLM"],
  ["activities",  "Activities"],
  ["assessment",  "Assessment"],
  ["homework",    "Home Work"],
];

const HEADER_FIELDS = [
  ["teacher_name",         "Name of the teacher"],
  ["designation",          "Designation"],
  ["class_section",        "Class & Section"],
  ["subject",              "Subject"],
  ["chapter",              "Chapter"],
  ["no_of_periods",        "No. of Periods"],
  ["date_of_commencement", "Date of Commencement"],
  ["expected_completion",  "Expected date of completion"],
  ["actual_completion",    "Actual date of completion"],
];

function EditableSection({ items }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const list = items || [];
    list.forEach((text, i) => {
      const line = document.createElement("div");
      line.className = "lp-item";
      if (list.length > 1) {
        const num = document.createElement("span");
        num.className = "lp-num";
        num.textContent = (i + 1) + ".";
        line.appendChild(num);
      }
      line.appendChild(document.createTextNode(text));
      el.appendChild(line);
    });
  }, [items]);

  const onPaste = e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return <div ref={ref} className="lp-fill" contentEditable suppressContentEditableWarning onPaste={onPaste} />;
}

function PlanForm({ plan, onSave, saving, saved }) {
  const sections = plan.sections || {};
  const [header, setHeader] = useState(() => ({ ...(plan.header || {}) }));
  useEffect(() => { setHeader({ ...(plan.header || {}) }); }, [plan]);
  const set = (key, value) => setHeader(h => ({ ...h, [key]: value }));

  return (
    <div className="animate-fade-in">
      <style>{`
        .lp-sheet { background:#fff; color:#17233a; padding:8mm 9mm 6mm; border-radius:14px;
                    box-shadow:0 6px 24px rgba(234,88,12,.10); font-size:13px; font-family: 'Inter', sans-serif; }
        .lp-school { width:100%; text-align:center; border:0; outline:0; background:transparent;
                     font:800 15pt/1.2 inherit; color:#9A3412; text-transform:uppercase; }
        .lp-doctype { text-align:center; font:700 10pt/1 inherit; color:#C2410C;
                      letter-spacing:.22em; margin:2mm 0 4mm; }
        .lp-head { display:grid; grid-template-columns:repeat(3,1fr); gap:2.5mm 7mm; margin-bottom:4mm; }
        .lp-f { display:flex; align-items:baseline; gap:2mm; min-width:0; }
        .lp-f > label { font:700 8.6pt/1 inherit; color:#C2410C; white-space:nowrap; flex:none; }
        .lp-f > input { flex:1; min-width:0; border:0; border-bottom:1px solid #C2410C; outline:0;
                        background:transparent; font:700 10pt/1.4 inherit; color:#17233a; padding:0 1mm 1px; }
        .lp-f > input:focus { border-bottom-width:2px; background:#FFF7ED; }
        .lp-body { display:grid; grid-template-columns:1fr 1fr; border:1.2px solid #C2410C; }
        .lp-col-l { border-right:1.2px solid #C2410C; }
        .lp-box + .lp-box { border-top:1.2px solid #C2410C; }
        .lp-split { display:grid; grid-template-columns:1.4fr 1fr; }
        .lp-split > .lp-box + .lp-box { border-top:0; border-left:1.2px solid #C2410C; }
        .lp-lbl { font:800 8.6pt/1 inherit; color:#C2410C; padding:1.6mm 2.5mm .8mm; }
        .lp-fill { padding:0 2.5mm 2mm; outline:0; font-size:9.5pt; font-weight: 500; line-height:1.5;
                   min-height:22mm; overflow-wrap:anywhere; }
        .lp-fill:focus { background:#FFF7ED; }
        .lp-item { padding-left:4.6mm; text-indent:-4.6mm; margin-bottom:.9mm; }
        .lp-num { color:#C2410C; font-weight:800; margin-right:1.4mm; }
        .lp-signs { display:flex; justify-content:space-between; margin-top:3.5mm;
                    font:800 9pt/1 inherit; color:#C2410C; }
        @page { size:A4 landscape; margin:8mm; }
        @media print {
          body * { visibility:hidden; }
          .lp-sheet, .lp-sheet * { visibility:visible; }
          .lp-sheet { position:absolute; left:0; top:0; width:100%;
                      padding:0; border-radius:0; box-shadow:none; }
          .lp-noprint { display:none !important; }
          .lp-f > input, .lp-fill { background:transparent !important; }
        }
      `}</style>

      <div className="lp-noprint flex gap-3 mb-4">
        <button
          onClick={onSave}
          disabled={saving || saved}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm"
          style={{
            background: saved ? "#ECFDF5" : "linear-gradient(135deg,#EA580C,#D97706)",
            color: saved ? "#059669" : "white",
            opacity: saving ? 0.7 : 1
          }}>
          {saved ? "✓ Saved to My Plans" : saving ? "Saving…" : "💾 Save Plan"}
        </button>
        <button
          onClick={() => window.print()}
          className="py-3 px-6 rounded-xl text-sm font-bold cursor-pointer hover:bg-orange-50 transition-colors"
          style={{ border: "2px solid #C2410C", color: "#C2410C", background: "transparent" }}>
          🖨 Print
        </button>
      </div>

      <div className="lp-sheet">
        <input className="lp-school" value={header.school_name || ""} placeholder="School name" onChange={e => set("school_name", e.target.value)} />
        <div className="lp-doctype">LESSON PLAN</div>
        <div className="lp-head">
          {HEADER_FIELDS.map(([key, label]) => (
            <span className="lp-f" key={key}>
              <label>{label}</label>
              <input value={header[key] ?? ""} onChange={e => set(key, e.target.value)} />
            </span>
          ))}
        </div>
        <div className="lp-body">
          <div className="lp-col-l">
            {["objectives", "outcomes"].map(key => (
              <div className="lp-box" key={key}>
                <div className="lp-lbl">{FORM_SECTIONS.find(s => s[0] === key)[1]} :</div>
                <EditableSection items={sections[key]} />
              </div>
            ))}
          </div>
          <div className="lp-col-r">
            <div className="lp-split">
              {["methodology", "tlm"].map(key => (
                <div className="lp-box" key={key}>
                  <div className="lp-lbl">{FORM_SECTIONS.find(s => s[0] === key)[1]} :</div>
                  <EditableSection items={sections[key]} />
                </div>
              ))}
            </div>
            {["activities", "assessment", "homework"].map(key => (
              <div className="lp-box" key={key}>
                <div className="lp-lbl">{FORM_SECTIONS.find(s => s[0] === key)[1]} :</div>
                <EditableSection items={sections[key]} />
              </div>
            ))}
          </div>
        </div>
        <div className="lp-signs">
          <span>Sign. of the Teacher</span>
          <span>Sign. of the Dean</span>
        </div>
      </div>
    </div>
  );
}

/* ── Saved plans list ───────────────────────────────────────────────── */
function SavedPlans({ plans, onDelete, onLoad }) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-500">कापि योजना न प्राप्ता (No saved plans yet)</p>
        <p className="text-[11px] font-bold mt-1 text-gray-400">Generate and save a lesson plan to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map(p => (
        <div key={p.lesson_plan_id}
          className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              <p className="text-sm font-extrabold text-gray-900 truncate">{p.title}</p>
            </div>
            <p className="text-[11px] font-bold text-gray-400 ml-9 uppercase tracking-wide">
              {p.chapter_text} · {p.duration_minutes} period(s) · {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onLoad(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors">
              पश्यन्तु (View)
            </button>
            <button onClick={() => onDelete(p.lesson_plan_id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function LessonPlannerPage() {
  const [tab,         setTab]         = useState("create"); 
  const [chapter,     setChapter]     = useState("");
  const [chapterName, setChapterName] = useState("");
  const [topic,       setTopic]       = useState("");
  const [periods,     setPeriods]     = useState(2);
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [objectives,  setObjectives]  = useState([""]);
  const [notes,       setNotes]       = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [plan,        setPlan]        = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [editing,     setEditing]     = useState(false); 
  const [genError,    setGenError]    = useState("");
  const [savedPlans,  setSavedPlans]  = useState([]);
  const [plansLoading,setPlansLoading]= useState(false);
  const rightRef = useRef(null);

  useEffect(() => {
    if (tab !== "saved") return;
    setPlansLoading(true);
    fetch(`${API}/api/v1/lesson-plans`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSavedPlans(d.plans || []))
      .catch(() => setSavedPlans([]))
      .finally(() => setPlansLoading(false));
  }, [tab]);

  const handleGenerate = async () => {
    if (!chapter) return;
    setEditing(false);
    setGenError("");
    setGenerating(true);
    setPlan(null);
    setSaved(false);
    try {
      const res = await fetch(`${API}/api/v1/lesson-plans/generate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          chapterId: parseInt(chapter),
          topic: topic || chapterName,
          noOfPeriods: periods,
          dateOfCommencement: dateFrom || null,
          expectedCompletion: dateTo || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlan(data);
      setTimeout(() => rightRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setPlan(null);
      setGenError("Couldn't generate the lesson plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!plan || saving || saved) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/v1/lesson-plans`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ plan }),
      });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/api/v1/lesson-plans/${id}`, { method: "DELETE", headers: getHeaders() });
    setSavedPlans(p => p.filter(x => x.lesson_plan_id !== id));
  };

  const backToEdit = () => setEditing(true);

  const addObjective   = () => setObjectives(o => [...o, ""]);
  const updateObjective = (i, v) => setObjectives(o => o.map((x, j) => j === i ? v : x));
  const removeObjective = (i) => setObjectives(o => o.filter((_, j) => j !== i));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-inter">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              पाठयोजना निर्माणम् <span className="text-sm font-bold text-gray-500 tracking-widest ml-1 uppercase">(AI Planner)</span>
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-500 pl-14">
            Generate structured, printable lesson plans instantly with AI
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden shrink-0 border border-orange-200 bg-white">
          {[
            { key: "create", label: "✨ नूतन योजना (Create)" },
            { key: "saved",  label: "📁 मम योजनाः (My Plans)" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2.5 text-sm font-bold cursor-pointer transition-colors"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#EA580C,#D97706)" : "white",
                color: tab === t.key ? "white" : "#6B7280",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Saved Plans Tab ─────────────────────────────────────────── */}
      {tab === "saved" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            सञ्चित योजनाः (Saved Plans)
          </h2>
          {plansLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse border border-gray-100" />)}
            </div>
          ) : (
            <SavedPlans plans={savedPlans} onDelete={handleDelete} onLoad={p => { setPlan(p.plan || p); setSaved(true); setEditing(false); setTab("create"); }} />
          )}
        </div>
      )}

      {/* ── Create Tab ──────────────────────────────────────────────── */}
      {tab === "create" && (
        generating ? (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <GeneratingAnimation />
          </div>
        ) : plan && !editing ? (
          <div className="max-w-4xl mx-auto space-y-4" ref={rightRef}>
            <button onClick={backToEdit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all bg-white text-orange-600 border border-orange-200 hover:bg-orange-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to edit inputs
            </button>
            <div className="bg-gray-50 rounded-2xl p-2 border border-gray-200 shadow-sm overflow-x-auto">
              <PlanForm plan={plan} onSave={handleSave} saving={saving} saved={saved} />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 space-y-6 border border-gray-100 shadow-sm">
            {plan && (
              <button onClick={() => setEditing(false)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors">
                <span>✨ Your last generated plan is ready</span>
                <span className="flex items-center gap-1">View result <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </button>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h2 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  विवरणम् (Plan Details)
                </h2>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Class / Subject / Chapter *</label>
              <ChapterPicker onChapterChange={(id, name) => { setChapter(id ? String(id) : ""); setChapterName(name); }} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Specific Topic <span className="text-gray-400 font-medium">(optional)</span>
              </label>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Preamble and Fundamental Rights"
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700">No. of Periods</label>
                <span className="text-sm font-black px-3 py-1 rounded-lg bg-orange-100 text-orange-700">{periods}</span>
              </div>
              <input type="range" min={1} max={8} step={1} value={periods} onChange={e => setPeriods(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer" />
              <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-1 px-1">
                <span>1</span><span>4</span><span>8</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Commencement</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 outline-none text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Expected completion</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 outline-none text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Custom Objectives <span className="text-gray-400 font-medium">(leave blank for AI defaults)</span>
              </label>
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={obj} onChange={e => updateObjective(i, e.target.value)}
                      placeholder={`Objective ${i + 1}`}
                      className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900"
                    />
                    {objectives.length > 1 && (
                      <button onClick={() => removeObjective(i)} className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                {objectives.length < 4 && (
                  <button onClick={addObjective} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors mt-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg> Add objective
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Special Notes <span className="text-gray-400 font-medium">(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="e.g. Include a debate activity, focus on rural context…"
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 resize-none focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900"
              />
            </div>

            {genError && (
              <div className="rounded-xl px-4 py-3 text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                {genError}
              </div>
            )}

            <button onClick={handleGenerate} disabled={!chapter || generating}
              className={`w-full py-3.5 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${(!chapter || generating) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shadow-md"}`}>
              {generating ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Generating…</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Generate AI Plan ✨</>
              )}
            </button>
          </div>
        )
      )}
    </div>
  );
}