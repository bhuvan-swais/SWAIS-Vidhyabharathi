"use client";

/**
 * Chapter Reader — shows the full text of a single chapter.
 * Provides a "Write Notes" action that jumps to the Notes page with this
 * chapter pre-selected, and a "Back" link to the chapter list.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchChapterDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NoteForm from "@/components/notes/NoteForm";

export default function ChapterReaderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsLoading(false); return; }
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchChapterDetail(id);
        setChapter(data);
      } catch (err) {
        console.error("Chapter detail error:", err.message);
        setChapter(null);
        setError(err.status === 404 ? "This chapter is not available." : (err.message || "Unable to load the chapter."));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, user, authLoading]);

  const title = chapter?.content_title || chapter?.chapter_name || "Chapter";
  const chapterLabel = chapter?.content_title || chapter?.chapter_name || "";

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in font-inter">
      
      {/* Back Link */}
      <Link href="/acharya/notes?tab=chapters"
        className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        सर्वं पश्यन्तु (All Chapters)
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
          <div className="h-96 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
        </div>
      ) : error || !chapter ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-red-100 shadow-sm">
          <p className="text-sm font-bold text-red-500">{error || "Chapter not found."}</p>
          <Link href="/acharya/notes?tab=chapters" className="inline-block mt-3 text-sm font-bold text-orange-600 hover:text-orange-700">
            Back to chapters
          </Link>
        </div>
      ) : (
        <>
          {/* Title bar + Write Notes */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden shadow-sm bg-gradient-to-r from-orange-500 to-amber-500">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100 mb-1">अध्यायः (Chapter)</p>
                <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>{title}</h1>
              </div>
              <button type="button" onClick={() => setNotesOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold shrink-0 transition-all cursor-pointer bg-white text-orange-600 hover:bg-orange-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                टिप्पणीं लिखतु (Write Notes)
              </button>
            </div>
          </div>

          {/* Content */}
          <article className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            {chapter.content ? (
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-gray-800">
                {chapter.content}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-bold text-gray-400">This chapter has no content yet.</p>
              </div>
            )}
          </article>

          {/* Bottom Write Notes */}
          <div className="flex justify-center pb-4 pt-2">
            <button type="button" onClick={() => setNotesOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white transition-all cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write Notes for this chapter
            </button>
          </div>
        </>
      )}

      {/* Note form modal */}
      <NoteForm
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        initialChapter={chapterLabel}
        onCreated={() => { setNotesOpen(false); router.push("/acharya/notes?tab=notes"); }}
      />
    </div>
  );
}