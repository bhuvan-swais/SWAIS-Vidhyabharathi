"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchChapters } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StudyMaterial from "@/components/chapters/StudyMaterial";

export default function ChaptersView() {
  const { user, isLoading: authLoading } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setChapters([]); setIsLoading(false); return; }
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchChapters();
        setChapters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Chapters API error:", err.message);
        setChapters([]);
        setError(err.message || "Unable to load chapters.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  const renderChapters = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      );
    }

    if (chapters.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-2xl border border-orange-50 shadow-sm">
        <div className="w-16 h-16 rounded-2xl ai-gradient flex items-center justify-center mx-auto mb-4 opacity-70">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
          </svg>
        </div>
        <p className="text-sm font-bold text-stone-500">
          {error ? "Chapters not available right now." : "No chapters found."}
        </p>
        <p className="text-xs mt-1 text-stone-400 font-medium">
          {error ? "Please try again shortly." : "Chapters added by the school will appear here."}
        </p>
      </div>
      );
    }

    return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-inter">
      {chapters.map((ch) => {
        const title = ch.content_title || ch.chapter_name || `Chapter ${ch.chapter_id}`;
        return (
          <Link
            key={ch.chapter_id}
            href={`/acharya/chapters/${ch.chapter_id}`}
            className="group flex flex-col justify-between gap-4 p-5 rounded-2xl bg-white transition-all shadow-sm border border-stone-100 hover:border-orange-200"
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(234,88,12,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl ai-gradient flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-snug text-stone-900 group-hover:text-orange-600 transition-colors">{title}</p>
                {ch.chapter_name && ch.content_title && ch.chapter_name !== ch.content_title && (
                  <p className="text-xs mt-0.5 truncate font-medium text-stone-400">{ch.chapter_name}</p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold self-start px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600">
              Read chapter (पठतु)
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        );
      })}
    </div>
    );
  };

  return (
    <div>
      <StudyMaterial />
      {renderChapters()}
    </div>
  );
}