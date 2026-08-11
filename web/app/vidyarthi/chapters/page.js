"use client";
// Chapters — browse by subject, open a chapter to read its content (from
// dem_chapter_content; empty in demo -> graceful empty state).
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function ChaptersPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [content, setContent] = useState(null);   // {chapter, data|null}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGet("/subjects").catch(() => []), apiGet("/chapters").catch(() => [])])
      .then(([s, c]) => { setSubjects(s || []); setChapters(c || []); })
      .finally(() => setLoading(false));
  }, []);

  async function openChapter(ch) {
    setContent({ chapter: ch, data: undefined });
    try {
      const d = await apiGet(`/chapter-content?chapter_id=${ch.chapter_id}`);
      setContent({ chapter: ch, data: d });
    } catch {
      setContent({ chapter: ch, data: null });   // 404 -> no content yet
    }
  }

  const shown = activeSubject ? chapters.filter((c) => c.subject_id === activeSubject) : chapters;

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">अध्याय</span> · Chapters</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button className="vb-pill" style={{ border: "none", cursor: "pointer", background: activeSubject == null ? "var(--saffron)" : "var(--saffron-soft)", color: activeSubject == null ? "#fff" : "var(--saffron-deep)" }} onClick={() => setActiveSubject(null)}>All</button>
        {subjects.map((s) => (
          <button key={s.subject_id} className="vb-pill" style={{ border: "none", cursor: "pointer", background: activeSubject === s.subject_id ? "var(--saffron)" : "var(--saffron-soft)", color: activeSubject === s.subject_id ? "#fff" : "var(--saffron-deep)" }} onClick={() => setActiveSubject(s.subject_id)}>{s.subject_name}</button>
        ))}
      </div>

      {loading ? <div className="vb-card" style={{ marginTop: 16 }}>Loading…</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginTop: 16 }}>
          {shown.map((ch) => (
            <button key={ch.chapter_id} className="vb-card" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }} onClick={() => openChapter(ch)}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{ch.subject_name} · Ch {ch.chapter_no}</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{ch.chapter_name}</div>
              {ch.description && <p style={{ color: "#6F5B45", fontSize: 13, marginTop: 6 }}>{ch.description}</p>}
            </button>
          ))}
          {shown.length === 0 && <div className="vb-card">No chapters.</div>}
        </div>
      )}

      {content && (
        <div className="vb-card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 20 }}>{content.chapter.chapter_name}</h2>
            <button className="vb-btn" onClick={() => setContent(null)}>✕</button>
          </div>
          {content.data === undefined ? <p style={{ color: "var(--muted)" }}>Loading content…</p>
            : content.data ? (
              <div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{content.data.title} · {content.data.language}</div>
                <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{content.data.content}</p>
              </div>
            ) : <p style={{ color: "var(--muted)" }}>No reading content published for this chapter yet.</p>}
        </div>
      )}
    </>
  );
}
