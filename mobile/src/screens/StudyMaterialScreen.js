import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { apiGet } from "../api";
import { Screen, Card, Btn, Muted, Loading, C } from "../ui";

export default function StudyMaterialScreen() {
  const [chapters, setChapters] = useState([]);
  const [open, setOpen] = useState(null);   // { chapter, data }
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiGet("/chapters").then((c) => setChapters(c || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  async function read(ch) {
    setOpen({ chapter: ch, data: undefined });
    try { setOpen({ chapter: ch, data: await apiGet(`/chapter-content?chapter_id=${ch.chapter_id}`) }); }
    catch { setOpen({ chapter: ch, data: null }); }
  }

  return (
    <Screen>
      <Muted style={{ marginBottom: 10 }}>Reading material by chapter.</Muted>
      {loading ? <Loading /> : chapters.map((ch) => (
        <Card key={ch.chapter_id}>
          <Muted style={{ fontSize: 12 }}>{ch.subject_name} · Ch {ch.chapter_no}</Muted>
          <Text style={{ fontWeight: "700", color: C.ink, marginTop: 3 }}>{ch.chapter_name}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Btn label="📖 Read" onPress={() => read(ch)} />
            <Btn label="⬇ PDF" disabled onPress={() => {}} />
          </View>
          {open?.chapter?.chapter_id === ch.chapter_id && (
            <View style={{ marginTop: 10 }}>
              {open.data === undefined ? <Muted>Loading…</Muted>
                : open.data ? <Text style={{ color: C.ink }}>{open.data.content}</Text>
                : <Muted>No reading content published for this chapter yet.</Muted>}
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}
