"use client";
// Quizzes — pick a chapter quiz, get AI-generated questions (safe fallback if the
// AI shape is unusable), answer, auto-score, and persist the score to the DB.
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { generateQuiz } from "../../../lib/aiService";

const FALLBACK = [
  { question: "Which statement best fits the chapter's main idea?", options: ["The central concept", "An unrelated fact", "A random guess", "None"], answer: 0 },
  { question: "Reviewing mistakes after a quiz helps you…", options: ["Learn faster", "Waste time", "Forget more", "Nothing"], answer: 0 },
  { question: "A good study habit is…", options: ["Cramming once", "Regular short sessions", "Skipping revision", "Ignoring notes"], answer: 1 },
];

function normalize(aiResp) {
  const raw = aiResp?.questions || aiResp?.quiz || (Array.isArray(aiResp) ? aiResp : null);
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = raw.map((q) => {
    const options = q.options || q.choices || [];
    let answer = q.answer ?? q.correct_index ?? q.correctIndex;
    if (typeof answer === "string") answer = options.indexOf(answer);
    return { question: q.question || q.text || "Question", options, answer: Number.isInteger(answer) ? answer : 0 };
  }).filter((q) => q.options.length >= 2);
  return out.length ? out : null;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [active, setActive] = useState(null);   // quiz row
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  function load() { apiGet("/quizzes").then((q) => setQuizzes(q || [])).catch(() => {}); }
  useEffect(() => { load(); }, []);

  async function take(quiz) {
    setActive(quiz); setSubmitted(false); setAnswers({}); setSavedMsg(""); setLoadingQ(true);
    try {
      const ai = await generateQuiz(quiz.quiz_title || "General", "Medium", 5);
      setQuestions(normalize(ai) || FALLBACK);
    } catch { setQuestions(FALLBACK); }
    finally { setLoadingQ(false); }
  }

  const correct = questions.reduce((n, q, i) => (answers[i] === q.answer ? n + 1 : n), 0);
  const total = questions.length || 1;
  const allAnswered = Object.keys(answers).length === questions.length && questions.length > 0;

  async function submit() {
    setSubmitted(true);
    const score = Math.round((correct / total) * (active.total_marks || 100)) / 1;
    try { await apiPost("/quiz-responses", { quiz_id: active.quiz_id, score }); setSavedMsg("Score saved ✓"); load(); }
    catch (e) { setSavedMsg("Save failed: " + e.message); }
  }

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">प्रश्नोत्तरी</span> · Quizzes</h1>
      <p style={{ color: "var(--muted)", marginTop: 4 }}>{quizzes.length} quizzes · AI-generated questions</p>

      {!active ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14, marginTop: 16 }}>
          {quizzes.map((q) => (
            <div key={q.quiz_id} className="vb-card">
              <div style={{ fontWeight: 600 }}>{q.quiz_title}</div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{q.total_marks} marks · {q.duration_minutes} min</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                {q.attempted ? <span className="vb-pill">Best: {q.my_score ?? "—"}</span> : <span style={{ color: "var(--muted)", fontSize: 13 }}>Not attempted</span>}
                <button className="vb-btn" style={{ background: "var(--saffron)", color: "#fff" }} onClick={() => take(q)}>Take</button>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && <div className="vb-card">No quizzes.</div>}
        </div>
      ) : (
        <div className="vb-card" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 20 }}>{active.quiz_title}</h2>
            <button className="vb-btn" onClick={() => setActive(null)}>← Back</button>
          </div>
          {loadingQ ? <p style={{ color: "var(--muted)", marginTop: 12 }}>Generating questions…</p> : (
            <>
              {questions.map((q, qi) => (
                <div key={qi} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600 }}>{qi + 1}. {q.question}</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {q.options.map((opt, oi) => {
                      const selected = answers[qi] === oi;
                      const isCorrect = submitted && q.answer === oi;
                      const isWrong = submitted && selected && q.answer !== oi;
                      return (
                        <label key={oi} style={{
                          padding: "10px 14px", borderRadius: 10, cursor: submitted ? "default" : "pointer",
                          border: "1px solid " + (isCorrect ? "#3B8E4E" : isWrong ? "#C0562A" : selected ? "var(--saffron)" : "var(--line)"),
                          background: isCorrect ? "#E7F5EA" : isWrong ? "#FCE7D2" : selected ? "var(--saffron-soft)" : "#fff",
                        }}>
                          <input type="radio" name={`q${qi}`} disabled={submitted} checked={selected}
                            onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))} style={{ marginRight: 10 }} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center" }}>
                {!submitted ? (
                  <button className="vb-btn" style={{ background: "var(--saffron)", color: "#fff" }} disabled={!allAnswered} onClick={submit}>Submit Quiz</button>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--saffron-deep)" }}>
                    Score: {correct}/{questions.length} · {savedMsg}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
