"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

const TYPE_META = {
  voice:       { icon: "🎤", label: "ध्वनिः (Voice)",       cls: "bg-orange-50 text-orange-700 border-orange-200" },
  handwritten: { icon: "✏️",  label: "हस्तलिखितम् (Write)", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  typed:       { icon: "⌨️",  label: "टङ्कितम् (Typed)",   cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function NoteCard({ note, onEdit, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking]               = useState(false);
  const [ttsSupported, setTtsSupported]           = useState(false);

  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => { if (isSpeaking) window.speechSynthesis?.cancel(); };
  }, [isSpeaking]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const getExcerpt = (text = "", max = 150) =>
    text.length <= max ? text : text.substring(0, max).trim() + "…";

  const handleDelete = () => {
    onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  const handleListen = () => {
    if (!ttsSupported) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = note.content?.trim();
    if (!text) return;

    const utterance     = new SpeechSynthesisUtterance(text);
    utterance.lang      = "en-IN";
    utterance.rate      = 0.9;
    utterance.pitch     = 1;
    utterance.onend     = () => setIsSpeaking(false);
    utterance.onerror   = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
  };

  const typeMeta  = TYPE_META[note.contentType] ?? TYPE_META.typed;
  const hasCanvas = !!note.canvasImageUrl;
  const hasText   = !!note.content?.trim();
  const canListen = ttsSupported && hasText;

  return (
    <div className="group bg-white rounded-2xl border-l-4 border-orange-500 border-y border-r border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden font-inter flex flex-col h-full">

      {/* ── Handwritten canvas preview ── */}
      {hasCanvas && (
        <div className="relative border-b border-orange-100 overflow-hidden bg-[#fffbeb]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.canvasImageUrl}
            alt={`Handwritten note: ${note.title}`}
            className="w-full object-cover max-h-40"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm
            rounded-full text-[10px] font-bold text-orange-800 border border-orange-200 shadow-sm">
            ✏️ हस्तलिखितम्
          </div>
        </div>
      )}

      {/* ── Card body ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Header: title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="flex-1 text-base font-extrabold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
            {note.title}
          </h3>
        </div>

        {/* Badges row: chapter + content type */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {note.chapter}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${typeMeta.cls}`}>
            <span>{typeMeta.icon}</span>
            {typeMeta.label}
          </span>
        </div>

        {/* Content excerpt */}
        <div className="flex-1">
          {hasText ? (
            <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">
              {getExcerpt(note.content)}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-400 italic mb-4">
              No text — see drawing above.
            </p>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 text-[11px] font-bold rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: date + listen + edit/delete */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2 flex-wrap mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(note.updatedAt)}
            {note.createdAt !== note.updatedAt && <span className="text-gray-300">(edited)</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(note)}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View
            </button>

            {canListen && (
              <button
                onClick={handleListen}
                title={isSpeaking ? "Stop" : "Listen"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                  ${isSpeaking ? "bg-red-500 text-white shadow-md" : "bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white"}`}
              >
                {isSpeaking ? (
                  <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg> विरामः (Stop)</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 16.172a4 4 0 010-5.656" /></svg> शृणोतु (Listen)</>
                )}
              </button>
            )}

            {!showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(note)}
                  className="hidden md:inline-flex p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                  title="सम्पादनम् (Edit)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="लोपयतु (Delete)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 animate-scale-in">
                <span className="text-xs text-red-600 font-bold">लोपयतु? (Delete?)</span>
                <button className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded" onClick={handleDelete}>Yes</button>
                <button className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded" onClick={() => setShowDeleteConfirm(false)}>No</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}