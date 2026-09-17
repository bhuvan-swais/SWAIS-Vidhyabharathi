"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const LANGUAGES = [
  { code: "sa",    label: "Default (संस्कृत/English)" }, 
  { code: "en",    label: "English" },
  { code: "hi",    label: "Hindi (हिंदी)" },
  { code: "te",    label: "Telugu (తెలుగు)" },
  { code: "ta",    label: "Tamil (தமிழ்)" },
  { code: "kn",    label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml",    label: "Malayalam (മലയാളം)" },
  { code: "mr",    label: "Marathi (मराठी)" },
  { code: "bn",    label: "Bengali (বাংলা)" },
  { code: "gu",    label: "Gujarati (ગુજરાતી)" },
  { code: "pa",    label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ur",    label: "Urdu (اردو)" },
];

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  
  const [showNotices, setShowNotices] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false); 
  const [langOpen, setLangOpen] = useState(false);
  
  const { theme, setTheme } = useTheme();
  
  // 1. ADDED 'ready' HERE
  const { i18n, ready } = useTranslation(); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("vb_acharya_token");
    const schoolId = localStorage.getItem("vb_school_id");
    if (!token || !schoolId) return;

    fetch(`${API}/api/v1/notices`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "x-school-id": schoolId
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setNotices(d.notices || []))
      .catch(() => setNotices([]));
  }, []);

  const handleProfileClick = () => {
    setShowProfile(v => !v);
    setShowNotices(false);
    setThemeOpen(false);
    setLangOpen(false);
  };

  const handleNoticeClick = () => {
    setShowNotices(v => !v);
    setShowProfile(false);
    setLangOpen(false);
  };

  const handleLangClick = () => {
    setLangOpen(v => !v);
    setShowProfile(false);
    setShowNotices(false);
  };

  // Helper to get the label of the currently selected language
  const currentLangCode = i18n.resolvedLanguage || 'sa';
  const currentLangLabel = LANGUAGES.find(l => l.code === currentLangCode)?.label || "Default (संस्कृत/English)";

  // 2. ADDED THIS BLOCK to prevent loading errors
  if (!ready) {
    return null; 
  }

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 h-[72px] flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 font-inter shadow-sm">
      <div className="flex items-center justify-between w-full">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="p-2 rounded-xl lg:hidden cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-500 transition-colors" aria-label="Toggle sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            {user?.subject && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                {user.subject}
              </span>
            )}
            {user?.class && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Class {user.class}{user?.section ? ` - ${user.section}` : ""}
                </span>
              </>
            )}
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
              ⚡ AI Active
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          
          {/* Custom Language Switcher Dropdown */}
          {mounted && (
            <div className="relative">
              <button 
                onClick={handleLangClick}
                className="flex items-center justify-between w-[220px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors shadow-sm"
              >
                <span className="truncate pr-2">{currentLangLabel}</span>
                <svg className={`w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute z-50 top-full right-0 mt-2 w-full max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                          currentLangCode === lang.code 
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="hidden sm:flex flex-col text-right">
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              {user?.name || "आचार्य (Teacher)"}
            </p>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{user?.email || "faculty@vidhyabharathi.org"}</p>
          </div>

          {/* Announcements bell */}
          <div className="relative">
            <button 
              onClick={handleNoticeClick}
              className="relative p-2.5 rounded-xl cursor-pointer text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notices.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 shadow-sm" />
              )}
            </button>

            {showNotices && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotices(false)} />
                <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-y-auto rounded-2xl z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="px-4 py-3 sticky top-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">सूचना (Announcements)</p>
                  </div>
                  {notices.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">No announcements yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {notices.map(n => (
                        <li key={n.notice_id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{n.title}</p>
                            {n.notice_date && (
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 shrink-0 mt-0.5 uppercase tracking-wide">
                                {new Date(n.notice_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                          {n.text && <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{n.text}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Avatar Profile Dropdown */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-70 blur-[2px]" />
            <button 
              onClick={handleProfileClick}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-orange-600 dark:text-orange-500 text-sm font-extrabold border-2 border-white dark:border-gray-900 shadow-sm transition-transform hover:scale-105"
            >
              {user?.avatar || "अ"}
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setShowProfile(false); setThemeOpen(false); }} />
                <div className="absolute right-0 mt-3 w-72 rounded-2xl z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
                  
                  {/* Expanded Profile Info with Avatar */}
                  <div className="px-5 py-5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 rounded-t-2xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                      {user?.avatar || "अ"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 truncate">{user?.name || "आचार्य (Teacher)"}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || "faculty@vidhyabharathi.org"}</p>
                    </div>
                  </div>

                  {/* Fully Custom Theme Toggle */}
                  <div className="p-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                      Appearance
                    </label>
                    {mounted && (
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setThemeOpen(!themeOpen); }}
                          className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {theme === 'system' && "💻 System Default"}
                            {theme === 'light' && "☀️ Light Mode"}
                            {theme === 'dark' && "🌙 Dark Mode"}
                          </span>
                          <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${themeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Custom Dropdown List */}
                        {themeOpen && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden py-1">
                            {[
                              { id: 'system', label: '💻 System Default' },
                              { id: 'light', label: '☀️ Light Mode' },
                              { id: 'dark', label: '🌙 Dark Mode' }
                            ].map(t => (
                              <button
                                key={t.id}
                                onClick={(e) => { e.stopPropagation(); setTheme(t.id); setThemeOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                                  theme === t.id 
                                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}