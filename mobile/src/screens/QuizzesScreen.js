import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { apiGet, apiPost } from "../api";
import { generateQuiz } from "../aiService";
import { Screen, Card, Btn, Pill, Muted, Loading, C } from "../ui";

const FALLBACK = [
  { question: "Which statement best fits the chapter's main idea?", options: ["The central concept", "An unrelated fact", "A random guess", "None"], answer: 0 },
  { question: "Reviewing mistakes after a quiz helps you…", options: ["Learn faster", "Waste time", "Forget more", "Nothing"], answer: 0 },
  { question: "A good study habit is…", options: ["Cramming once", "Regular short sessions", "Skipping revision", "Ignoring notes"], answer: 1 },
];
function normalize(ai) {
  const raw = ai?.questions || ai?.quiz || (Array.isArray(ai) ? ai : null);
  if (!Array.isArray(raw) || !raw.length) return null;
  const out = raw.map((q) => {
    const options = q.options || q.choices || [];
    let answer = q.answer ?? q.correct_index ?? q.correctIndex;
    if (typeof answer === "string") answer = options.indexOf(answer);
    return { question: q.question || q.text || "Question", options, answer: Number.isInteger(answer) ? answer : 0 };
  }).filter((q) => q.options.length >= 2);
  return out.length ? out : null;
}

export default function QuizzesScreen() {
  const [quizzes, setQuizzes] = useState([]);
  const [active, setActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [saved, setSaved] = useState("");

  function load() { apiGet("/quizzes").then((q) => setQuizzes(q || [])).catch(() => {}); }
  useEffect(() => { load(); }, []);

  async function take(q) {
    setActive(q); setSubmitted(false); setAnswers({}); setSaved(""); setLoadingQ(true);
    try { const ai = await generateQuiz(q.quiz_title || "General", "Medium", 5); setQuestions(normalize(ai) || FALLBACK); }
    catch { setQuestions(FALLBACK); } finally { setLoadingQ(false); }
  }

  const correct = questions.reduce((n, q, i) => (answers[i] === q.answer ? n + 1 : n), 0);
  const allAnswered = Object.keys(answers).length === questions.length && questions.length > 0;

  async function submit() {
    setSubmitted(true);
    const score = Math.round((correct / (questions.length || 1)) * (active.total_marks || 100));
    try { await apiPost("/quiz-responses", { quiz_id: active.quiz_id, score }); setSaved("Saved ✓"); load(); }
    catch (e) { setSaved("Save failed"); }
  }

  if (active) {
    return (
      <Screen sk="प्रश्नोत्तरी" title={active.quiz_title}>
        <Btn label="← Back" onPress={() => setActive(null)} style={{ alignSelf: "flex-start", marginBottom: 8 }} />
        {loadingQ ? <Loading /> : (
          <>
            {questions.map((q, qi) => (
              <Card key={qi}>
                <Text style={{ fontWeight: "700", color: C.ink }}>{qi + 1}. {q.question}</Text>
                {q.options.map((opt, oi) => {
                  const sel = answers[qi] === oi, ok = submitted && q.answer === oi, bad = submitted && sel && q.answer !== oi;
                  return (
                    <TouchableOpacity key={oi} disabled={submitted} onPress={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      style={{ marginTop: 8, padding: 11, borderRadius: 10, borderWidth: 1,
                        borderColor: ok ? "#3B8E4E" : bad ? C.saffronDeep : sel ? C.saffron : C.line,
                        backgroundColor: ok ? "#E7F5EA" : bad ? C.soft : sel ? C.soft : "#fff" }}>
                      <Text style={{ color: C.ink }}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </Card>
            ))}
            {!submitted ? <Btn label="Submit Quiz" primary disabled={!allAnswered} onPress={submit} />
              : <Text style={{ fontSize: 18, fontWeight: "800", color: C.saffronDeep }}>Score: {correct}/{questions.length} · {saved}</Text>}
          </>
        )}
      </Screen>
    );
  }

  return (
    <Screen sk="प्रश्नोत्तरी" title="Quizzes">
      <Muted style={{ marginBottom: 10 }}>{quizzes.length} quizzes · AI-generated questions</Muted>
      {quizzes.map((q) => (
        <Card key={q.quiz_id}>
          <Text style={{ fontWeight: "700", color: C.ink }}>{q.quiz_title}</Text>
          <Muted style={{ fontSize: 13, marginTop: 3 }}>{q.total_marks} marks · {q.duration_minutes} min</Muted>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            {q.attempted ? <Pill label={`Best: ${q.my_score ?? "—"}`} /> : <Muted style={{ fontSize: 13 }}>Not attempted</Muted>}
            <Btn label="Take" primary onPress={() => take(q)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
