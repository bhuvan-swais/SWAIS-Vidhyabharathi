import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { apiGet } from "../api";
import { generateContent } from "../aiService";
import { Screen, Card, Btn, Pill, Muted, C } from "../ui";

export default function AssessmentsScreen() {
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [advice, setAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    Promise.all([apiGet("/exams").catch(() => []), apiGet("/marks").catch(() => [])])
      .then(([e, m]) => { setExams(e || []); setMarks(m || []); });
  }, []);

  const weakest = marks.length ? marks.reduce((lo, m) => ((m.percentage ?? 101) < (lo.percentage ?? 101) ? m : lo), marks[0]) : null;
  async function getAdvice() {
    if (!weakest?.subject) return;
    setLoadingAdvice(true); setAdvice("");
    try { const r = await generateContent(weakest.subject, "Average"); setAdvice(r?.content || r?.text || r?.generated_text || (r ? JSON.stringify(r) : "No advice returned.")); }
    finally { setLoadingAdvice(false); }
  }

  return (
    <Screen sk="परीक्षा" title="Assessments">
      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginBottom: 8 }}>Exam Schedule</Text>
      {exams.length === 0 ? <Card><Muted>No exams scheduled.</Muted></Card> : exams.map((e) => (
        <Card key={e.exam_id}>
          <Text style={{ fontWeight: "700", color: C.ink }}>{e.exam_name}</Text>
          <Muted style={{ marginTop: 4 }}>{e.exam_type} · {e.academic_year}</Muted>
          <Muted style={{ marginTop: 2 }}>{e.start_date} → {e.end_date}</Muted>
        </Card>
      ))}

      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginTop: 12, marginBottom: 8 }}>My Results</Text>
      {marks.length === 0 ? <Card><Muted>No results yet.</Muted></Card> : marks.map((m) => (
        <Card key={m.marks_id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700", color: C.ink }}>{m.subject}</Text>
            <Pill label={m.grade || "—"} />
          </View>
          <Muted style={{ marginTop: 4 }}>{m.exam} · {m.marks_obtained}/{m.max_marks} · {m.percentage}%</Muted>
        </Card>
      ))}

      {weakest && (
        <Card>
          <Text style={{ fontWeight: "700", color: C.ink }}>AI Study Advice — {weakest.subject}</Text>
          <Btn label={loadingAdvice ? "Thinking…" : "Get advice"} primary disabled={loadingAdvice} onPress={getAdvice} style={{ marginTop: 10, alignSelf: "flex-start" }} />
          {advice ? <Text style={{ marginTop: 10, color: C.copy }}>{advice}</Text> : null}
        </Card>
      )}
    </Screen>
  );
}
