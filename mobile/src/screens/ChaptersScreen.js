import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { apiGet } from "../api";
import { Screen, Card, Muted, Loading, C } from "../ui";

export default function ChaptersScreen() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [subj, setSubj] = useState(null);
  const [open, setOpen] = useState(null);   // { chapter, data }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGet("/subjects").catch(() => []), apiGet("/chapters").catch(() => [])])
      .then(([s, c]) => { setSubjects(s || []); setChapters(c || []); }).finally(() => setLoading(false));
  }, []);

  async function openCh(ch) {
    setOpen({ chapter: ch, data: undefined });
    try { setOpen({ chapter: ch, data: await apiGet(`/chapter-content?chapter_id=${ch.chapter_id}`) }); }
    catch { setOpen({ chapter: ch, data: null }); }
  }

  const shown = subj ? chapters.filter((c) => c.subject_id === subj) : chapters;
  const Chip = ({ id, label }) => (
    <TouchableOpacity onPress={() => setSubj(id)} style={{ borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: subj === id ? C.saffron : C.soft }}>
      <Text style={{ color: subj === id ? "#fff" : C.saffronDeep, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen sk="अध्याय" title="Chapters">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <Chip id={null} label="All" />
        {subjects.map((s) => <Chip key={s.subject_id} id={s.subject_id} label={s.subject_name} />)}
      </ScrollView>

      {loading ? <Loading /> : shown.map((ch) => (
        <TouchableOpacity key={ch.chapter_id} onPress={() => openCh(ch)}>
          <Card>
            <Muted style={{ fontSize: 12 }}>{ch.subject_name} · Ch {ch.chapter_no}</Muted>
            <Text style={{ fontWeight: "700", color: C.ink, marginTop: 3 }}>{ch.chapter_name}</Text>
            {ch.description ? <Text style={{ color: C.copy, marginTop: 5 }}>{ch.description}</Text> : null}
          </Card>
        </TouchableOpacity>
      ))}

      {open && (
        <Card style={{ borderColor: C.saffron }}>
          <Text style={{ fontWeight: "800", color: C.ink, fontSize: 16 }}>{open.chapter.chapter_name}</Text>
          {open.data === undefined ? <Muted style={{ marginTop: 8 }}>Loading…</Muted>
            : open.data ? <Text style={{ marginTop: 8, color: C.ink }}>{open.data.content}</Text>
            : <Muted style={{ marginTop: 8 }}>No reading content published for this chapter yet.</Muted>}
        </Card>
      )}
    </Screen>
  );
}
