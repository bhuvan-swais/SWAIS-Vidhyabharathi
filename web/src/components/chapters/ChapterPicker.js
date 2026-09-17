"use client";
import { useEffect, useState } from "react";
import { fetchClasses, fetchSubjects, fetchChaptersBySubject } from "@/lib/api";

const fieldStyle = {
  border: "1.5px solid #E7E5E4",
  color: "#1C1917",
  background: "white",
};

function PickerField({ label, options, value, onChange, disabled, placeholder, getId, getLabel }) {
  if (!disabled && options.length === 1) {
    return (
      <div
        className="w-full px-3 py-2.5 rounded-xl text-sm flex items-center border-orange-100 font-medium"
        style={{ ...fieldStyle, background: "#FAFAFA" }}
        title={`Only one ${label.toLowerCase()} available`}
      >
        <span className="truncate">{getLabel(options[0])}</span>
      </div>
    );
  }
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
      style={fieldStyle}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={getId(o)} value={getId(o)}>{getLabel(o)}</option>
      ))}
    </select>
  );
}

export default function ChapterPicker({ onChapterChange }) {
  const [classes,   setClasses]   = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [chapters,  setChapters]  = useState([]);
  const [classId,   setClassId]   = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");

  useEffect(() => {
    fetchClasses()
      .then(list => {
        const arr = Array.isArray(list) ? list : [];
        setClasses(arr);
        if (arr.length === 1) setClassId(String(arr[0].class_id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSubjects([]); setSubjectId("");
    setChapters([]); setChapterId("");
    if (!classId) return;
    fetchSubjects(classId)
      .then(list => {
        const arr = Array.isArray(list) ? list : [];
        setSubjects(arr);
        if (arr.length === 1) setSubjectId(String(arr[0].subject_id));
      })
      .catch(() => {});
  }, [classId]);

  useEffect(() => {
    setChapters([]); setChapterId("");
    if (!subjectId) return;
    fetchChaptersBySubject(subjectId)
      .then(list => {
        const arr = Array.isArray(list) ? list : [];
        setChapters(arr);
        if (arr.length === 1) setChapterId(String(arr[0].chapter_id));
      })
      .catch(() => {});
  }, [subjectId]);

  useEffect(() => {
    const ch = chapters.find(c => String(c.chapter_id) === String(chapterId));
    onChapterChange(
      chapterId ? Number(chapterId) : "",
      ch ? (ch.content_title || ch.chapter_name || "") : ""
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-inter">
      <PickerField
        label="Class"
        options={classes}
        value={classId}
        onChange={setClassId}
        placeholder="Select class (कक्षा)"
        getId={c => c.class_id}
        getLabel={c => c.label || c.class_name}
      />
      <PickerField
        label="Subject"
        options={subjects}
        value={subjectId}
        onChange={setSubjectId}
        disabled={!classId}
        placeholder={classId ? "Select subject (विषयः)" : "Select class first"}
        getId={s => s.subject_id}
        getLabel={s => s.subject_name}
      />
      <PickerField
        label="Chapter"
        options={chapters}
        value={chapterId}
        onChange={setChapterId}
        disabled={!subjectId}
        placeholder={subjectId ? "Select chapter (अध्यायः)" : "Select subject first"}
        getId={ch => ch.chapter_id}
        getLabel={ch => ch.content_title || ch.chapter_name}
      />
    </div>
  );
}