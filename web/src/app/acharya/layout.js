"use client";

/**
 * Acharya Layout — Shell with Sidebar + Header
 * Migrated to VidhyaBharathi Architecture.
 * Wraps all /acharya/* pages with the navigation chrome.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotesProvider } from "@/context/NotesContext";
import { ToastProvider } from "@/components/ui/Toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function AcharyaShell({ children }) {
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin shadow-sm" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AcharyaLayout({ children }) {
  return (
    <AuthProvider>
      <NotesProvider>
        <ToastProvider>
          <AcharyaShell>{children}</AcharyaShell>
        </ToastProvider>
      </NotesProvider>
    </AuthProvider>
  );
}