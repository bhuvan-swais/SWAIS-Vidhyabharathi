import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { apiGet } from "../api";
import { Screen, Card, Stat, Pill, Muted, Loading, C } from "../ui";

export default function ProgressScreen() {
  const [marks, setMarks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGet("/marks").catch(() => []), apiGet("/quiz-responses").catch(() => [])])
      .then(([m, q]) => { setMarks(m || []); setQuizzes(q || []); }).finally(() => setLoading(false));
  }, []);

  const avg = marks.length ? Math.round(marks.map((m) => m.percentage).filter((x) => x != null).reduce((a, b, _, arr) => a + b / arr.length, 0)) : null;

  return (
    <Screen sk="प्रगति" title="Progress">
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat value={avg != null ? avg + "%" : "—"} en="Avg Score" />
        <Stat value={marks.length} en="Exams" />
        <Stat value={quizzes.length} en="Quizzes" />
      </View>

      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginTop: 16, marginBottom: 8 }}>Exam Marks</Text>
      {loading ? <Loading /> : marks.length === 0 ? <Card><Muted>No marks recorded yet.</Muted></Card> :
        marks.map((m) => (
          <Card key={m.marks_id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", color: C.ink }}>{m.subject}</Text>
              <Pill label={m.grade || "—"} />
            </View>
            <Muted style={{ marginTop: 4 }}>{m.exam} · {m.marks_obtained}/{m.max_marks} · {m.percentage}%</Muted>
          </Card>
        ))}

      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginTop: 12, marginBottom: 8 }}>Quiz History</Text>
      <Card style={{ padding: 0 }}>
        {quizzes.length === 0 ? <Text style={{ padding: 16, color: C.muted }}>No quizzes taken yet.</Text> :
          quizzes.map((q, i) => (
            <View key={q.response_id} style={{ flexDirection: "row", justifyContent: "space-between", padding: 13, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
              <Text style={{ color: C.ink }}>Quiz #{q.quiz_id}</Text>
              <Text style={{ fontWeight: "700", color: C.saffronDeep }}>{q.score != null ? q.score : "—"}</Text>
            </View>
          ))}
      </Card>
    </Screen>
  );
}
