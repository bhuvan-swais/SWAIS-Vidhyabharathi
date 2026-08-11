"use client";
// Help — quick FAQ for the student portal.
const FAQ = [
  ["How do I submit an assignment?", "Open Assignments, tap Submit on a card, type your answer, and press Send. Your marks and teacher remarks appear once graded."],
  ["How do quizzes work?", "Open Quizzes, pick one, and tap Take. Questions are AI-generated; answer all, submit, and your score is saved automatically."],
  ["What is the AI Learning Path?", "Enter your recent learning signals (reading time, quiz score, retries, comprehension). We classify your reading style and build a personalized study plan."],
  ["Can I read content in my language?", "Yes — pick a language in the top bar. Assignments and study material can be translated, and study text can be read aloud."],
  ["Where do I see my progress?", "Progress shows your exam marks and past quiz scores. Assessments shows the exam schedule and AI study advice."],
];

export default function HelpPage() {
  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">सहायता</span> · Help</h1>
      <p style={{ color: "var(--muted)", marginTop: 4 }}>Common questions about the student portal.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {FAQ.map(([q, a]) => (
          <div key={q} className="vb-card">
            <div style={{ fontWeight: 600 }}>{q}</div>
            <p style={{ color: "#6F5B45", marginTop: 6 }}>{a}</p>
          </div>
        ))}
      </div>
    </>
  );
}
