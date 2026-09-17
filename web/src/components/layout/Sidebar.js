"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LOGIN_URL } from "@/lib/api";
import { useTranslation } from "react-i18next";

const navItems = [
  {
    labelKey: "dashboard",
    href: "/acharya",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    labelKey: "notes",
    href: "/acharya/notes",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    labelKey: "classes",
    href: "/acharya/classes",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    labelKey: "assessments",
    href: "/acharya/assessments",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    labelKey: "reports",
    href: "/acharya/reports",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    labelKey: "lesson_planner",
    href: "/acharya/lesson-planner",
    badge: "AI",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    labelKey: "auto_test",
    href: "/acharya/auto-test",
    badge: "AI",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    labelKey: "translator",
    href: "/acharya/translator",
    badge: "AI",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    labelKey: "audio_translator",
    href: "/acharya/audio-translator",
    badge: "AI",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V4a3 3 0 00-3-3H9" />
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  // 1. ADDED 'ready' HERE
  const { t, ready } = useTranslation(); 
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout API failed, forcing local cleanup", error);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    window.location.href = LOGIN_URL;
  };

  // 2. ADDED THIS BLOCK to prevent loading errors
  if (!ready) {
    return null; 
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-[72px] shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
            VB
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">VBK Faculty!</h1>
            <p className="text-[11px] font-bold text-orange-600 dark:text-orange-500 mt-0.5 uppercase tracking-wide">Acharya Portal</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg lg:hidden cursor-pointer text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto font-inter">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {t('main_menu', 'Main Menu')}
          </p>

          {navItems.map((item, idx) => {
            const isActive = item.href === "/acharya"
              ? pathname === "/acharya"
              : pathname.startsWith(item.href);
            const isFirstAI = item.badge === "AI" && (idx === 0 || navItems[idx - 1].badge !== "AI");

            return (
              <div key={item.labelKey}>
                {isFirstAI && (
                  <p className="px-3 mt-6 mb-3 text-[10px] font-bold uppercase tracking-widest text-orange-400 dark:text-orange-500">
                    {t('ai_features', 'AI Features')}
                  </p>
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-500 border border-orange-100 dark:border-orange-500/20 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className={`${isActive ? "text-orange-600 dark:text-orange-500" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                    {item.icon}
                  </span>
                  <span>{t(item.labelKey)}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-extrabold text-orange-700 dark:text-orange-400">{t('ai_active', 'AI Active')}</p>
              <p className="text-[9px] font-bold text-orange-600/70 dark:text-orange-500/70 uppercase tracking-wide">VBK Faculty! System</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('sign_out', 'Sign out')}</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => !loggingOut && setShowLogoutConfirm(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-500/10 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{t('sign_out_confirm_title', 'Sign out?')}</h2>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
              {t('sign_out_message', 'You will be signed out and taken back to the login page.')}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} disabled={loggingOut} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('cancel', 'Cancel')}
              </button>
              <button onClick={handleLogout} disabled={loggingOut} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm">
                {loggingOut ? t('signing_out', 'Signing out...') : t('yes_sign_out', 'Yes, Sign Out')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}