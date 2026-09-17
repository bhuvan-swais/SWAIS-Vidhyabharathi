"use client";

import { useState, useMemo } from "react";
import { useNotes } from "@/context/NotesContext";
import { useToast } from "@/components/ui/Toast";
import NoteCard from "@/components/notes/NoteCard";
import SearchBar from "@/components/ui/SearchBar";

export default function NoteList({ onEditNote }) {
  const { notes, chapters, isLoading, removeNote } = useNotes();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const handleDelete = async (id) => {
    try {
      await removeNote(id);
      toast.success("Note deleted successfully", "Deleted");
    } catch {
      toast.error("Could not delete note. Please try again.", "Error");
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.chapter.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChapter =
        !selectedChapter || note.chapter === selectedChapter;

      return matchesSearch && matchesChapter;
    });
  }, [notes, searchQuery, selectedChapter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-12 flex-1 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-12 w-48 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="h-5 w-3/4 mb-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-32 mb-4 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-4 w-full mb-2 bg-gray-50 rounded animate-pulse" />
              <div className="h-4 w-5/6 mb-2 bg-gray-50 rounded animate-pulse" />
              <div className="h-4 w-2/3 mb-6 bg-gray-50 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="शीर्षकम्, पाठः वा अन्विष्यतु... (Search notes...)"
            value={searchQuery}
            onChange={setSearchQuery}
            id="notes-search"
            className="focus-within:ring-orange-200 focus-within:border-orange-500"
          />
        </div>
        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all duration-200 cursor-pointer shadow-sm"
          id="notes-chapter-filter"
        >
          <option value="">सर्वे पाठाः (All Chapters)</option>
          {chapters.map((chapter) => {
            const label = typeof chapter === "string" ? chapter : (chapter.content_title ?? chapter.chapter_name ?? String(chapter.chapter_id));
            const key   = typeof chapter === "string" ? chapter : chapter.chapter_id;
            return <option key={key} value={label}>{label}</option>;
          })}
        </select>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-gray-500">
          Showing <span className="font-extrabold text-gray-900">{filteredNotes.length}</span> {filteredNotes.length === 1 ? "note" : "notes"}
          {(searchQuery || selectedChapter) && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedChapter(""); }}
              className="ml-3 text-orange-600 hover:text-orange-700 transition-colors text-xs font-bold cursor-pointer bg-orange-50 px-2 py-1 rounded-md"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* ── Notes Grid or Empty State ── */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4 shadow-inner">
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            कापि टिप्पणी न प्राप्ता (No notes found)
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-xs mt-2">
            {searchQuery || selectedChapter
              ? "Try adjusting your search or filter criteria."
              : "Create your first note to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}