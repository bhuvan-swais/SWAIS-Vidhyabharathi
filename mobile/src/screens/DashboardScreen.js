import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { apiGet } from "../api";
import { Screen, Card, Stat, Muted, C } from "../ui";

export default function DashboardScreen() {
  const [name, setName] = useState("Vidyarthi");
  const [stats, setStats] = useState({ assignments: 0, avg: "—", chapters: "—" });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    apiGet("/students/current").then((d) => d?.student?.full_name && setName(d.student.full_name)).catch(() => {});
    apiGet("/assignments").then((d) => { if (Array.isArray(d)) { setAssignments(d.slice(0, 5)); setStats((s) => ({ ...s, assignments: d.length })); } }).catch(() => {});
    apiGet("/chapters").then((d) => Array.isArray(d) && setStats((s) => ({ ...s, chapters: d.length }))).catch(() => {});
    apiGet("/marks").then((d) => {
      if (Array.isArray(d) && d.length) {
        const p = d.map((m) => m.percentage).filter((x) => x != null);
        if (p.length) setStats((s) => ({ ...s, avg: Math.round(p.reduce((a, b) => a + b, 0) / p.length) + "%" }));
      }
    }).catch(() => {});
  }, []);

  return (
    <Screen>
      <View style={{ marginBottom: 6 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: C.ink }}>SWAIS</Text>
        <Muted><Text>विद्यार्थी · Student</Text></Muted>
      </View>
      <Card>
        <Text style={{ fontSize: 22, fontWeight: "800", color: C.ink }}>नमस्ते, {name} 👋</Text>
        <Text style={{ color: C.copy, marginTop: 6 }}>Your learning at a glance — the five-fold Panchakosha vision.</Text>
      </Card>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Stat value={stats.assignments} sk="कार्य" en="Assignments" />
        <Stat value={stats.avg} sk="औसत अंक" en="Avg Score" />
        <Stat value={stats.chapters} sk="अध्याय" en="Chapters" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: "700", color: C.ink, marginTop: 18, marginBottom: 8 }}>आज का कार्य (Assignments)</Text>
      <Card style={{ padding: 0 }}>
        {assignments.length === 0 ? <Text style={{ padding: 18, color: C.muted }}>No assignments yet.</Text> :
          assignments.map((a, i) => (
            <View key={a.assignment_id || i} style={{ padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.line, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "600", color: C.ink, flex: 1 }} numberOfLines={1}>{a.title || "Assignment"}</Text>
              <Text style={{ color: C.muted, marginLeft: 8 }}>{a.due_date || ""}</Text>
            </View>
          ))}
      </Card>
    </Screen>
  );
}
