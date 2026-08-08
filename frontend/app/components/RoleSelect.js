"use client";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "../roles";

// Custom accessible role picker (mouse + keyboard: ↑ ↓ Enter Esc Home End).
export default function RoleSelect({ value, onChange, id = "role" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);

  const selected = ROLES.find((r) => r.path === value) || null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      const i = ROLES.findIndex((r) => r.path === value);
      setActive(i >= 0 ? i : 0);
    }
  }, [open, value]);

  const choose = (r) => { onChange(r.path); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault(); setOpen(true); return;
    }
    if (!open) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((i) => (i + 1) % ROLES.length); break;
      case "ArrowUp": e.preventDefault(); setActive((i) => (i - 1 + ROLES.length) % ROLES.length); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(ROLES.length - 1); break;
      case "Enter": case " ": e.preventDefault(); choose(ROLES[active]); break;
      case "Escape": e.preventDefault(); setOpen(false); break;
      case "Tab": setOpen(false); break;
      default: break;
    }
  };

  return (
    <div className={`rs ${open ? "rs-open" : ""}`} ref={rootRef}>
      <button
        type="button" id={id} className={`rs-trigger ${selected ? "" : "rs-placeholder"}`}
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown}>
        {selected ? (
          <span className="rs-val">
            <span className="rs-ic">{ICONS[selected.path]}</span>
            <span className="rs-labels">
              <span className="rs-sk dev">{selected.sk}</span>
              <span className="rs-en">{selected.en}</span>
            </span>
          </span>
        ) : (
          <span>Choose a role</span>
        )}
        <Chevron />
      </button>

      {open && (
        <ul className="rs-panel" role="listbox">
          {ROLES.map((r, i) => {
            const isSel = r.path === value;
            return (
              <li
                key={r.path} role="option" aria-selected={isSel}
                className={`rs-opt ${i === active ? "rs-active" : ""} ${isSel ? "rs-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}>
                <span className="rs-ic">{ICONS[r.path]}</span>
                <span className="rs-labels">
                  <span className="rs-sk dev">{r.sk}</span>
                  <span className="rs-en">{r.en}</span>
                </span>
                {isSel && <Check />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const ICONS = {
  "/vidyarthi": (
    <svg viewBox="0 0 24 24" className="rs-svg"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" /></svg>
  ),
  "/acharya": (
    <svg viewBox="0 0 24 24" className="rs-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
  ),
  "/palaka": (
    <svg viewBox="0 0 24 24" className="rs-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  "/pradhana": (
    <svg viewBox="0 0 24 24" className="rs-svg"><path d="M9 11H5a2 2 0 0 0-2 2v7h6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3h4a2 2 0 0 1 2 2v11h-6" /><path d="m9 15 2 2 4-4" /></svg>
  ),
  "/nyasa": (
    <svg viewBox="0 0 24 24" className="rs-svg"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v4M12 11l-5 6M12 11l5 6" /></svg>
  ),
};

const Chevron = () => (
  <svg viewBox="0 0 24 24" className="rs-chev"><path d="m6 9 6 6 6-6" /></svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" className="rs-check"><path d="M20 6 9 17l-5-5" /></svg>
);
