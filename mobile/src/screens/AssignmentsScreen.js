import { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import { apiGet, apiPost } from "../api";
import { translateText } from "../aiService";
import { useLanguage } from "../context/LanguageContext";
import { Screen, Card, Btn, Pill, Muted, Loading, C } from "../ui";

export default function AssignmentsScreen() {
  const { selectedLanguage } = useLanguage();
  const [list, setList] = useState([]);
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [tx, setTx] = useState({});
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([apiGet("/assignments"), apiGet("/submissions").catch(() => [])]);
      setList(Array.isArray(a) ? a : []);
      const m = {}; (s || []).forEach((x) => { m[x.assignment_id] = x; }); setSubs(m);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit(id) {
    if (!answer.trim()) { setStatus("Type an answer first."); return; }
    setStatus("Submitting…");
    try { await apiPost("/submissions", { assignment_id: id, submission_text: answer }); setStatus("Submitted ✓"); setAnswer(""); setOpenId(null); load(); }
    catch (e) { setStatus("Failed: " + e.message); }
  }
  async function translate(a) {
    const r = await translateText(a.text || a.title || "", selectedLanguage);
    setTx((t) => ({ ...t, [a.assignment_id]: r?.translated_text || r?.text || "(no translation)" }));
  }

  return (
    <Screen sk="कार्य" title="Assignments">
      <Muted style={{ marginBottom: 10 }}>{list.length} assignments · translating to {selectedLanguage}</Muted>
      {loading ? <Loading /> : list.map((a) => {
        const sub = subs[a.assignment_id];
        return (
          <Card key={a.assignment_id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", color: C.ink, flex: 1 }}>{a.title || "Assignment"}</Text>
              <Muted>due {a.due_date || "—"}</Muted>
            </View>
            {a.text ? <Text style={{ color: C.copy, marginTop: 6 }}>{a.text}</Text> : null}
            {tx[a.assignment_id] ? <Text style={{ marginTop: 8, padding: 10, backgroundColor: C.soft, borderRadius: 10, color: C.saffronDeep }}>{tx[a.assignment_id]}</Text> : null}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Btn label="🌐 Translate" onPress={() => translate(a)} />
              {sub ? <Pill label={sub.marks_obtained != null ? `Submitted · ${sub.marks_obtained}` : "Submitted"} />
                   : <Btn label="✍️ Submit" onPress={() => { setOpenId(openId === a.assignment_id ? null : a.assignment_id); setAnswer(""); setStatus(""); }} />}
            </View>
            {openId === a.assignment_id && (
              <View style={{ marginTop: 10 }}>
                <TextInput value={answer} onChangeText={setAnswer} placeholder="Type your answer…" multiline
                  style={{ borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: "top" }} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <Btn label="Send" primary onPress={() => submit(a.assignment_id)} />
                  <Muted>{status}</Muted>
                </View>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
