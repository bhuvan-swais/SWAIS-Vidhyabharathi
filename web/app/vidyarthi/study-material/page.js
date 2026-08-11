"use client";
// Study Material — reading material per chapter. Content comes from
// dem_chapter_content; downloadable files from the repository (empty in demo,
// so those render as "coming soon"). AI can read the text aloud (text-to-voice).
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { textToVoice } from "../../../lib/aiService";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function StudyMaterialPage() {
  const { selectedLanguage } = useLanguage();
  const [chapters, setChapters] = useState([]);
  const [open, setOpen] = useState(null);       // { chapter, data }
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState("");

  useEffect(() => {
    apiGet("/chapters").then((c) => setChapters(c || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function read(ch) {
    setOpen({ chapter: ch, data: undefined }); setAudio("");
    try { setOpen({ chapter: ch, data: await apiGet(`/chapter-content?chapter_id=${ch.chapter_id}`) }); }
    catch { setOpen({ chapter: ch, data: null }); }
  }

  async function speak(text) {
    setAudio("loading");
    const url = await textToVoice(text, selectedLanguage);
    setAudio(url || "");
  }

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">अध्ययन सामग्री</span> · Study Material</h1>
      <p style={{ color: "var(--muted)", marginTop: 4 }}>Reading material by chapter. Listen in <b>{selectedLanguage}</b> with AI voice.</p>

      {loading ? <div className="vb-card" style={{ marginTop: 16 }}>Loading…</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginTop: 16 }}>
          {chapters.map((ch) => (
            <div key={ch.chapter_id} className="vb-card">
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{ch.subject_name} · Ch {ch.chapter_no}</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{ch.chapter_name}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="vb-btn" onClick={() => read(ch)}>📖 Read</button>
                <button className="vb-btn" title="No file uploaded yet" disabled style={{ opacity: 0.5 }}>⬇ PDF</button>
              </div>
            </div>
          ))}
          {chapters.length === 0 && <div className="vb-card">No study material.</div>}
        </div>
      )}

      {open && (
        <div className="vb-card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 20 }}>{open.chapter.chapter_name}</h2>
            <button className="vb-btn" onClick={() => setOpen(null)}>✕</button>
          </div>
          {open.data === undefined ? <p style={{ color: "var(--muted)" }}>Loading…</p>
            : open.data ? (
              <>
                <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{open.data.content}</p>
                <div style={{ marginTop: 12 }}>
                  <button className="vb-btn" onClick={() => speak(open.data.content)}>🔊 Read aloud</button>
                  {audio === "loading" && <span style={{ marginLeft: 10, color: "var(--muted)" }}>Generating audio…</span>}
                  {audio && audio !== "loading" && <audio controls src={audio} style={{ display: "block", marginTop: 10, width: "100%" }} />}
                </div>
              </>
            ) : <p style={{ color: "var(--muted)" }}>No reading content published for this chapter yet.</p>}
        </div>
      )}
    </>
  );
}
