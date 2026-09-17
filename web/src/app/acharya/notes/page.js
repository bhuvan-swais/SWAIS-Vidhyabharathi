"use client";

/**
 * Notes & Chapters — single section with two tabs.
 *   • Chapters tab  → browse chapters; opening one goes to the full reader
 *   • Notes tab     → create / manage notes
 *
 * Active tab is driven by the URL (?tab=chapters|notes) so it's deep-linkable
 * (e.g. the chapter reader sends the user to ?tab=notes after creating a note).
 */

import { useState, useEffect } from "react";
import ChaptersView from "@/components/chapters/ChaptersView";
import NotesView from "@/components/notes/NotesView";

const TABS = [
  { key: "chapters", label: "पाठाः (Chapters)" },
  { key: "notes",    label: "टिप्पण्यः (Notes)" },
];

export default function NotesChaptersPage() {
  const [tab, setTab] = useState("chapters");

  // Read the initial tab from the URL (?tab=notes) on mount.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "notes" || t === "chapters") setTab(t);
  }, []);

  const switchTab = (key) => {
    setTab(key);
    // keep the URL in sync without a full navigation on the new Acharya route
    window.history.replaceState(null, "", `/acharya/notes?tab=${key}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in font-inter">
      {/* ── Dual-Language Header ── */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #EA580C, #F97316)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            टिप्पण्यः <span className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-2">(Notes & Chapters)</span>
          </h1>
        </div>
        <p className="text-sm pl-10 font-bold text-gray-500">
          Read curriculum chapters and manage your personal study notes.
        </p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex w-full max-w-md gap-3">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-center transition-all cursor-pointer shadow-sm"
              style={active
                ? { background: "linear-gradient(135deg,#EA580C,#C2410C)", color: "white" }
                : { background: "white", color: "#64748B", border: "1px solid #FED7AA" }}
              onMouseEnter={(e) => { 
                if (!active) { 
                  e.currentTarget.style.background = "#FFF7ED"; 
                  e.currentTarget.style.color = "#C2410C"; 
                  e.currentTarget.style.borderColor = "#F97316";
                } 
              }}
              onMouseLeave={(e) => { 
                if (!active) { 
                  e.currentTarget.style.background = "white"; 
                  e.currentTarget.style.color = "#64748B"; 
                  e.currentTarget.style.borderColor = "#FED7AA";
                } 
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      <div className="pt-2">
        {tab === "chapters" ? <ChaptersView /> : <NotesView />}
      </div>
    </div>
  );
}