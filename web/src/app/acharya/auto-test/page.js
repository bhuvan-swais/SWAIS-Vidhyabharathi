"use client";

import { useState } from "react";
import ChapterPicker from "@/components/chapters/ChapterPicker";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QTYPES = ["MCQ", "True/False", "Short Answer"];

/* ─── Configure Step ──────────────────────────────────────── */
function ConfigStep({ onGenerate }) {
  const [chapterId,   setChapterId]   = useState("");
  const [chapterName, setChapterName] = useState("");
  const [difficulty,  setDifficulty]  = useState("Medium");
  const [qtype,       setQtype]       = useState("");
  const [totalMarks,  setTotalMarks]  = useState(50);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-xl mx-auto border border-gray-100 font-inter">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            परीक्षणं सज्जीकरोतु <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">(Configure)</span>
          </h2>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Select chapter, difficulty, and total marks</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chapter */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2 text-gray-600">📖 Class / Subject / Chapter</label>
          <ChapterPicker onChapterChange={(id, name) => { setChapterId(id); setChapterName(name); }} />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2 text-gray-600">🎯 Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => {
              const colors = { Easy: "#059669", Medium: "#D97706", Hard: "#DC2626" };
              const bgs    = { Easy: "#ECFDF5", Medium: "#FFFBEB", Hard: "#FEF2F2" };
              const active = difficulty === d;
              return (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer border ${active ? "shadow-sm" : ""}`}
                  style={active
                    ? { background: bgs[d], color: colors[d], borderColor: colors[d] }
                    : { background: "#F9FAFB", color: "#9CA3AF", borderColor: "#E5E7EB" }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2 text-gray-600">
            🧩 Question Type <span className="text-[10px] font-bold text-gray-400 normal-case">(optional)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QTYPES.map(t => (
              <button key={t} onClick={() => setQtype(prev => prev === t ? "" : t)}
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer border ${qtype === t ? "bg-orange-500 text-white border-orange-600 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300"}`}>
                {t}
              </button>
            ))}
            <button onClick={() => setQtype("")}
              className={`py-2.5 px-2 rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer border ${qtype === "" ? "bg-orange-500 text-white border-orange-600 shadow-sm" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300"}`}>
              All
            </button>
          </div>
        </div>

        {/* Total Marks */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2 flex items-center justify-between text-gray-600">
            <span>🔢 Total Marks</span>
            <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{totalMarks}</span>
          </label>
          <input type="range" min={10} max={100} step={10} value={totalMarks}
            onChange={e => setTotalMarks(Number(e.target.value))}
            className="w-full cursor-pointer accent-orange-600" />
          <div className="flex justify-between text-[10px] font-bold mt-1 text-gray-400 px-1">
            <span>10</span><span>100</span>
          </div>
        </div>

        {/* Preview info */}
        <div className="p-4 rounded-xl flex items-start gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
          <span className="text-base mt-0.5">⚡</span>
          <div>
            <p className="text-xs font-extrabold text-orange-700 uppercase tracking-widest">AI will generate:</p>
            <p className="text-xs font-bold mt-1 text-orange-900">
              <span className="font-black">{difficulty}</span> · {totalMarks} marks ·{" "}
              <span className="font-black">{qtype || "All question types"}</span> ·{" "}
              {chapterName || "Selected chapter"}
            </p>
          </div>
        </div>

        <button
          onClick={() => onGenerate({ chapterId, chapterName, difficulty, totalMarks, qtype })}
          disabled={!chapterId}
          className={`w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all cursor-pointer shadow-md ${!chapterId ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"}`}>
          ✨ परीक्षणं सृजतु (Generate Test)
        </button>
      </div>
    </div>
  );
}

/* ─── Generating Step ─────────────────────────────────────── */
function GeneratingStep({ config }) {
  const steps = [
    "Analysing chapter content…",
    "Applying difficulty settings…",
    "Generating questions with AI…",
    "Preparing answer key…",
    "Finalising test paper…",
  ];
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm max-w-xl mx-auto text-center border border-gray-100 font-inter">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
        <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold mb-1 text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        AI is generating your test…
      </h2>
      <p className="text-xs font-bold mb-8 text-gray-500 uppercase tracking-widest">
        {config.difficulty} · {config.totalMarks} marks · {config.chapterName}
      </p>
      <div className="space-y-3 text-left w-3/4 mx-auto">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.3}s` }}>
            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-600">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Question Card ───────────────────────────────────────── */
function QuestionCard({ question, index }) {
  const text    = question.question ?? question.q ?? question.questionText ?? `Question ${index + 1}`;
  const options = question.options ?? question.opts ?? question.choices ?? [];
  const answer  = question.answer ?? question.ans ?? question.correctAnswer ?? question.correct_answer ?? null;
  const marks   = question.marks ?? question.maxMarks ?? question.max_marks ?? null;

  return (
    <div className="bg-white rounded-2xl p-6 transition-all border border-gray-100 shadow-sm">
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-black flex-shrink-0 mt-0.5 border border-orange-200">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-gray-900 leading-relaxed">{text}</p>
            {marks && (
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md shrink-0 bg-gray-50 text-gray-500 border border-gray-200">
                {marks}m
              </span>
            )}
          </div>

          {options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {options.map((opt, oi) => {
                const optText = typeof opt === "object" ? (opt.text ?? opt.label ?? JSON.stringify(opt)) : opt;
                const isCorrect = answer !== null && (
                  oi === answer || optText === answer || String(oi) === String(answer) || optText?.toLowerCase() === String(answer)?.toLowerCase()
                );
                return (
                  <div key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-colors border ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold" : "bg-gray-50 border-gray-200 text-gray-600 font-medium"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {optText}
                    {isCorrect && <span className="ml-auto text-emerald-600">✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {options.length === 0 && (answer === true || answer === false || String(answer).toLowerCase() === "true" || String(answer).toLowerCase() === "false") && (
            <div className="flex gap-2 mt-2">
              {[true, false].map(v => {
                const isAns = String(v) === String(answer)?.toLowerCase() || v === answer;
                return (
                  <span key={String(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${isAns ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                    {v ? "True" : "False"} {isAns && "✓"}
                  </span>
                );
              })}
            </div>
          )}

          {answer && options.length === 0 && typeof answer !== "boolean" && String(answer).toLowerCase() !== "true" && String(answer).toLowerCase() !== "false" && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-emerald-600">Answer</p>
              <p className="text-xs font-bold text-emerald-900 leading-relaxed">{String(answer)}</p>
            </div>
          )}

          {!answer && options.length === 0 && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-gray-400">Answer Space</p>
              <div className="h-10 rounded" style={{ background: "repeating-linear-gradient(transparent, transparent 19px, #E5E7EB 19px, #E5E7EB 20px)" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Preview Step ────────────────────────────────────────── */
function PreviewStep({ config, questions, rawResponse, onReset }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (saved) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm max-w-xl mx-auto text-center border border-gray-100 font-inter">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl bg-emerald-50 border border-emerald-100">✅</div>
        <h2 className="text-xl font-extrabold mb-1 text-emerald-600" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Test Saved!
        </h2>
        <p className="text-sm font-bold text-gray-500">Added to your Assessments dashboard.</p>
      </div>
    );
  }

  if (questions.length === 0 && rawResponse) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 font-inter">
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-100 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900">AI Generated Test</h2>
          <button onClick={onReset} className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
            ← Reconfigure
          </button>
        </div>
        <div className="bg-white rounded-2xl p-6 whitespace-pre-wrap text-sm font-medium text-gray-800 border border-gray-100 shadow-sm" style={{ lineHeight: 1.7 }}>
          {typeof rawResponse === "string" ? rawResponse : JSON.stringify(rawResponse, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 font-inter">
      <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100">{config.difficulty}</span>
            <span>·</span>
            <span>{config.totalMarks} marks</span>
            {config.qtype && <><span className="mx-1">·</span><span>{config.qtype}</span></>}
          </div>
          <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Test Preview — <span className="text-orange-600">{questions.length} Questions</span>
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={onReset} className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
            ← Reconfigure
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md">
            💾 Save
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => <QuestionCard key={idx} question={q} index={idx} />)}
      </div>

      <div className="bg-white rounded-2xl p-5 flex justify-end border border-gray-100 shadow-sm">
        <button onClick={handleSave} className="px-6 py-3 rounded-xl text-sm font-extrabold text-white cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md">
          💾 Save as Assessment
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function AutoTestPage() {
  const [step,        setStep]        = useState(0);
  const [config,      setConfig]      = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [error,       setError]       = useState("");

  const handleGenerate = async (cfg) => {
    setConfig(cfg);
    setError("");
    setStep(1);

    try {
      const body = {
        chapterId:  cfg.chapterId,
        difficulty: cfg.difficulty,
        totalMarks: cfg.totalMarks,
        questionType: cfg.qtype || null, 
      };

      const res = await fetch(`${API}/api/v1/question-papers/generate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || `Error ${res.status}`);
      }

      const qs =
        Array.isArray(data)                          ? data :
        Array.isArray(data?.questions)               ? data.questions :
        Array.isArray(data?.data)                    ? data.data :
        Array.isArray(data?.questionPaper)           ? data.questionPaper :
        Array.isArray(data?.question_paper)          ? data.question_paper :
        null;

      setRawResponse(qs ? null : (typeof data?.questionPaper === "string" ? data.questionPaper : data));
      setQuestions(qs ?? []);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to generate test. Please try again.");
      setStep(0);
    }
  };

  const handleReset = () => {
    setStep(0);
    setConfig(null);
    setQuestions([]);
    setRawResponse(null);
    setError("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-inter">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              स्वतः परीक्षणम् <span className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">(Auto Test)</span>
            </h1>
          </div>
          <p className="text-sm pl-12 font-bold text-gray-500">
            AI-powered question paper generation
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {["Configure", "Generating", "Preview"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`w-6 h-1 rounded-full ${step > i - 1 ? "bg-orange-500" : "bg-gray-200"}`} />}
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                  step === i ? "bg-orange-600 text-white" : step > i ? "bg-orange-100 text-orange-600" : "bg-white border border-gray-200 text-gray-400"
                }`}>
                  {step > i ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${
                  step === i ? "text-orange-600" : step > i ? "text-orange-400" : "text-gray-400"
                }`}>{s}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-red-50 border border-red-200 shadow-sm">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {step === 0 && <ConfigStep onGenerate={handleGenerate} />}
      {step === 1 && <GeneratingStep config={config} />}
      {step === 2 && (
        <PreviewStep config={config} questions={questions} rawResponse={rawResponse} onReset={handleReset} />
      )}
    </div>
  );
}