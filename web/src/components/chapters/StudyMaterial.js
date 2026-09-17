"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchClasses,
  fetchSubjects,
  fetchChaptersBySubject,
  fetchChapterFiles,
  uploadChapterFile,
  replaceChapterFile,
  deleteChapterFile,
} from "@/lib/api";

const selectStyle = {
  background: "white",
  border: "1.5px solid rgba(234,88,12,0.15)",
  color: "#1C1917",
};

function PickerField({ label, options, value, onChange, disabled, placeholder, getId, getLabel }) {
  if (!disabled && options.length === 1) {
    return (
      <div
        className="w-full px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 font-medium"
        style={{ ...selectStyle, background: "#FAFAFA" }}
        title={`Only one ${label.toLowerCase()} available`}
      >
        <span className="truncate" style={{ color: "#1C1917" }}>{getLabel(options[0])}</span>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
      style={selectStyle}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={getId(o)} value={getId(o)}>{getLabel(o)}</option>
      ))}
    </select>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudyMaterial() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);

  const uploadRef = useRef(null);
  const replaceRef = useRef(null);
  const replaceTarget = useRef(null);

  useEffect(() => {
    fetchClasses()
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setClasses(list);
        if (list.length === 1) setClassId(String(list[0].class_id));
      })
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    setSubjects([]); setSubjectId("");
    setChapters([]); setChapterId("");
    setFiles([]);
    if (!classId) return;
    fetchSubjects(classId)
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setSubjects(list);
        if (list.length === 1) setSubjectId(String(list[0].subject_id));
      })
      .catch(() => setSubjects([]));
  }, [classId]);

  useEffect(() => {
    setChapters([]); setChapterId("");
    setFiles([]);
    if (!subjectId) return;
    fetchChaptersBySubject(subjectId)
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setChapters(list);
        if (list.length === 1) setChapterId(String(list[0].chapter_id));
      })
      .catch(() => setChapters([]));
  }, [subjectId]);

  const loadFiles = async (id = chapterId) => {
    if (!id) { setFiles([]); return; }
    setFilesLoading(true);
    try {
      setFiles(await fetchChapterFiles(id));
    } catch {
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => { loadFiles(chapterId); /* eslint-disable-next-line */ }, [chapterId]);

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !chapterId) return;
    setBusy("upload");
    try {
      await uploadChapterFile(chapterId, file);
      await loadFiles();
      notify("ok", `"${file.name}" uploaded.`);
    } catch (err) {
      notify("err", err.message || "Upload failed.");
    } finally {
      setBusy("");
    }
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    const fileId = replaceTarget.current;
    e.target.value = "";
    if (!file || !fileId) return;
    setBusy(`replace:${fileId}`);
    try {
      await replaceChapterFile(fileId, file);
      await loadFiles();
      notify("ok", "File replaced — the previous copy is kept for this academic year.");
    } catch (err) {
      notify("err", err.message || "Replace failed.");
    } finally {
      setBusy("");
      replaceTarget.current = null;
    }
  };

  const askReplace = (fileId) => {
    replaceTarget.current = fileId;
    replaceRef.current?.click();
  };

  const handleDelete = async (file) => {
    if (!confirm(`Remove "${file.file_name}" from this chapter?\n\nIt stays recoverable until the end of the academic year.`)) return;
    setBusy(`delete:${file.file_id}`);
    try {
      await deleteChapterFile(file.file_id);
      await loadFiles();
      notify("ok", "File removed.");
    } catch (err) {
      notify("err", err.message || "Delete failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm font-inter" style={{ border: "1px solid rgba(234,88,12,0.15)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </span>
        <h2 className="text-base font-black text-stone-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Study Material (पठनसामग्री)
        </h2>
      </div>
      <p className="text-xs mb-5 pl-10 font-semibold text-stone-400">
        Upload chapter study material — PDFs, docs, or presentations.
      </p>

      {/* Cascading selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PickerField
          label="Class"
          options={classes}
          value={classId}
          onChange={setClassId}
          placeholder="Select class"
          getId={c => c.class_id}
          getLabel={c => c.label || c.class_name}
        />
        <PickerField
          label="Subject"
          options={subjects}
          value={subjectId}
          onChange={setSubjectId}
          disabled={!classId}
          placeholder={classId ? "Select subject" : "Select class first"}
          getId={s => s.subject_id}
          getLabel={s => s.subject_name}
        />
        <PickerField
          label="Chapter"
          options={chapters}
          value={chapterId}
          onChange={setChapterId}
          disabled={!subjectId}
          placeholder={subjectId ? "Select chapter" : "Select subject first"}
          getId={ch => ch.chapter_id}
          getLabel={ch => ch.content_title || ch.chapter_name}
        />
      </div>

      <input ref={uploadRef} type="file" className="hidden" onChange={handleUpload} />
      <input ref={replaceRef} type="file" className="hidden" onChange={handleReplace} />

      {message && (
        <div
          className="mt-4 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm"
          style={message.type === "ok"
            ? { background: "#ECFDF5", color: "#059669" }
            : { background: "#FEF2F2", color: "#DC2626" }}
        >
          {message.text}
        </div>
      )}

      {/* Upload */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
        <p className="text-xs font-bold text-stone-400">
          {!chapterId
            ? "Select a chapter to manage files"
            : filesLoading
              ? "Loading files…"
              : `${files.length} file${files.length === 1 ? "" : "s"} in this chapter`}
        </p>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          disabled={!chapterId || busy === "upload"}
          title={chapterId ? "Upload a file for this chapter" : "Select a class, subject and chapter first"}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer shadow-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {busy === "upload" ? "Uploading…" : "Upload file"}
        </button>
      </div>

      {/* Files List */}
      {chapterId && (
        <div className="mt-4">
          {!filesLoading && files.length === 0 && (
            <div className="text-center py-8 rounded-xl bg-stone-50 border border-stone-100">
              <p className="text-sm font-bold text-stone-500">No study material yet.</p>
              <p className="text-xs mt-1 font-medium text-stone-400">Upload a file to get started.</p>
            </div>
          )}

          <div className="space-y-2">
            {files.map(f => (
              <div
                key={f.file_id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-100/50">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold truncate text-stone-800">{f.file_name}</p>
                    <p className="text-[11px] font-medium text-stone-400 mt-0.5">
                      {f.uploaded_by ? `${f.uploaded_by} · ` : ""}{formatDate(f.uploaded_at)}
                      {f.version_no > 1 ? ` · v${f.version_no}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={f.view_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => askReplace(f.file_id)}
                    disabled={busy === `replace:${f.file_id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60 bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    {busy === `replace:${f.file_id}` ? "Replacing…" : "Replace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f)}
                    disabled={busy === `delete:${f.file_id}`}
                    className="p-1.5 rounded-lg cursor-pointer disabled:opacity-60 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete file"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}