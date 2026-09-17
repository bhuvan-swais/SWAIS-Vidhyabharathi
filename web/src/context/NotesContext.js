"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const NotesContext = createContext(undefined);

export function NotesProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("vb_acharya_token");
    const schoolId = localStorage.getItem("vb_school_id");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-school-id": schoolId,
    };
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNotes([]);
      setChapters([]);
      setIsLoading(false);
      return;
    }
    
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = getHeaders();
        const [notesRes, chaptersRes] = await Promise.all([
          fetch(`${API}/api/v1/notes`, { headers }),
          fetch(`${API}/api/v1/chapters`, { headers })
        ]);
        
        if (notesRes.ok) {
          const nd = await notesRes.json();
          setNotes(nd.notes || nd);
        }
        if (chaptersRes.ok) {
          const cd = await chaptersRes.json();
          setChapters(cd.chapters || cd);
        }
      } catch (err) {
        console.error("Notes API error:", err.message);
        setError(err.message || "Unable to load notes.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  const addNote = useCallback(async (noteData) => {
    const res = await fetch(`${API}/api/v1/notes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(noteData),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const newNote = await res.json();
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const editNote = useCallback(async (id, updates) => {
    const res = await fetch(`${API}/api/v1/notes/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const updated = await res.json();
    setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
    return updated;
  }, []);

  const removeNote = useCallback(async (id) => {
    const res = await fetch(`${API}/api/v1/notes/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const getNoteById = useCallback((id) => notes.find((note) => note.id === id) || null, [notes]);

  const value = { notes, chapters, isLoading, error, addNote, editNote, removeNote, getNoteById, totalNotes: notes.length };
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}