"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    iconBg:  "#ECFDF5",
    iconColor: "#10B981",
    bar:     "#10B981",
    border:  "#A7F3D0",
    title:   "#065F46",
    msg:     "#047857",
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    iconBg:  "#FEF2F2",
    iconColor: "#EF4444",
    bar:     "#EF4444",
    border:  "#FECACA",
    title:   "#991B1B",
    msg:     "#B91C1C",
  },
  info: { // Transformed to VidhyaBharathi Orange
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:  "#FFF7ED",
    iconColor: "#EA580C",
    bar:     "#EA580C",
    border:  "#FFEDD5",
    title:   "#9A3412",
    msg:     "#C2410C",
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg:  "#FFFBEB",
    iconColor: "#F59E0B",
    bar:     "#F59E0B",
    border:  "#FDE68A",
    title:   "#92400E",
    msg:     "#B45309",
  },
};

const DURATION = 3500;

function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100);
  const [visible,  setVisible]  = useState(false);
  const intervalRef = useRef(null);
  const v = VARIANTS[toast.type] ?? VARIANTS.info;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const step = 100 / (DURATION / 50);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p <= 0) { clearInterval(intervalRef.current); return 0; }
        return p - step;
      });
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, DURATION);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity:   visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        background: "#ffffff",
        border: `1px solid ${v.border}`,
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(234,88,12,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
        width: 340,
        maxWidth: "calc(100vw - 32px)",
        position: "relative",
        fontFamily: "var(--font-inter, system-ui)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 14px 16px 14px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: v.iconBg, color: v.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {v.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          {toast.title && (
            <p style={{ fontSize: 13, fontWeight: 800, color: v.title, marginBottom: 2, lineHeight: 1.3 }}>
              {toast.title}
            </p>
          )}
          <p style={{ fontSize: 13, fontWeight: 500, color: v.msg, lineHeight: 1.5 }}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={dismiss}
          style={{
            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#A8A29E", cursor: "pointer", background: "transparent",
            border: "none", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F5F5F4"; e.currentTarget.style.color = "#57534E"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A8A29E"; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#F5F5F4" }}>
        <div style={{
          height: "100%", background: v.bar, borderRadius: "0 0 0 16px",
          width: `${progress}%`,
          transition: "width 0.05s linear",
        }} />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "info", title = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        alignItems: "flex-end", pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");

  return {
    success: (message, title) => ctx.show(message, "success", title),
    error:   (message, title) => ctx.show(message, "error",   title),
    info:    (message, title) => ctx.show(message, "info",    title),
    warning: (message, title) => ctx.show(message, "warning", title),
  };
}