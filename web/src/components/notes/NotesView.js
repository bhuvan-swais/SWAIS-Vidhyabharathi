"use client";

/**
 * NotesView — the notes list + create/edit form (used inside the tabbed page).
 * Migrated to VidhyaBharathi Architecture.
 */

import { useState } from "react";
import NoteList from "@/components/notes/NoteList";
import NoteForm from "@/components/notes/NoteForm";

export default function NotesView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6 font-inter">
      {/* ── Action Bar ── */}
      <div className="flex justify-end">
        <button 
          onClick={handleCreateNote} 
          id="create-note-btn"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #EA580C, #C2410C)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          नूतन टिप्पणी (New Note)
        </button>
      </div>

      {/* ── Children Components ── */}
      <NoteList onEditNote={handleEditNote} />

      <NoteForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editNote={editingNote}
      />
    </div>
  );
}