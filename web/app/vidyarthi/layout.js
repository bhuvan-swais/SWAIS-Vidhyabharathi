"use client";
// Sidebar shell for the Vidyarthi (student) portal — grouped nav with icons + AI
// badges, a styled language menu, and a responsive mobile drawer. Warm saffron
// theme (Vidhyabharathi identity). Wraps LanguageProvider so pages can translate.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider, useLanguage, LANGUAGES } from "../../src/context/LanguageContext";
import { apiGet } from "../../lib/api";

const GROUPS = [
  { title: "शिक्षण · Learn", items: [
    { sk: "गृह", en: "Dashboard", href: "/vidyarthi", icon: "home" },
    { sk: "अध्याय", en: "Chapters", href: "/vidyarthi/chapters", icon: "book" },
    { sk: "अध्ययन", en: "Study Material", href: "/vidyarthi/study-material", icon: "bookOpen" },
  ]},
  { title: "अभ्यास · Practice", items: [
    { sk: "कार्य", en: "Assignments", href: "/vidyarthi/assignments", icon: "edit" },
    { sk: "प्रश्नोत्तरी", en: "Quizzes", href: "/vidyarthi/quizzes", icon: "help" },
    { sk: "परीक्षा", en: "Assessments", href: "/vidyarthi/assessments", icon: "clipboard" },
    { sk: "प्रगति", en: "Progress", href: "/vidyarthi/progress", icon: "trending" },
  ]},
  { title: "एआई · AI Features", items: [
    { sk: "एआई पथ", en: "AI Learning Path", href: "/vidyarthi/ai-learning-path", icon: "sparkles", ai: true },
    { sk: "अनुवादक", en: "AI Translator", href: "/vidyarthi/ai-translator", icon: "globe", ai: true },
  ]},
];

const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
function Icon({ name }) {
  const paths = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    bookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12" y2="17.01" /></>,
    clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" /><path d="M9 14l2 2 4-4" /></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
    lifebuoy: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.9" y1="4.9" x2="9.2" y2="9.2" /><line x1="14.8" y1="14.8" x2="19.1" y2="19.1" /><line x1="14.8" y1="9.2" x2="19.1" y2="4.9" /><line x1="4.9" y1="19.1" x2="9.2" y2="14.8" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>,
    chevron: <><polyline points="6 9 12 15 18 9" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" {...P}>{paths[name]}</svg>;
}

function LangMenu() {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="vb-lang" onClick={() => setOpen((o) => !o)}>
        <Icon name="globe" />
        <span style={{ flex: 1, textAlign: "left" }}>{selectedLanguage}</span>
        <Icon name="chevron" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
          <div className="vb-langpop">
            {LANGUAGES.map((l) => (
              <button key={l.code} className="vb-langopt" data-on={l.name === selectedLanguage}
                onClick={() => { changeLanguage(l.name); setOpen(false); }}>
                {l.name}{l.name === selectedLanguage ? " ✓" : ""}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Shell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);          // mobile drawer
  const [name, setName] = useState("Vidyarthi");

  useEffect(() => { apiGet("/students/current").then((d) => d?.student?.full_name && setName(d.student.full_name)).catch(() => {}); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);  // close drawer on navigate

  function logout() { if (typeof window !== "undefined") { localStorage.removeItem("vb_token"); location.href = "/"; } }

  const NavLink = ({ it }) => {
    const active = pathname === it.href;
    return (
      <a href={it.href} className={`vb-nav${active ? " active" : ""}`}>
        <Icon name={it.icon} />
        <span className="vb-nav-t"><span className="dev">{it.sk}</span> · {it.en}</span>
        {it.ai && <span className="vb-ai">AI</span>}
      </a>
    );
  };

  return (
    <div className="vb-shell">
      {/* mobile top bar */}
      <div className="vb-topbar">
        <button className="vb-hamb" onClick={() => setOpen(true)} aria-label="Menu"><Icon name="menu" /></button>
        <div style={{ fontFamily: "var(--serif)", fontWeight: 700 }}>SWAIS</div>
      </div>

      {open && <div className="vb-scrim" onClick={() => setOpen(false)} />}

      <aside className={`vb-side${open ? " open" : ""}`}>
        <div className="vb-brand">
          <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 22 }}>SWAIS</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}><span className="dev">विद्यार्थी</span> · Student Portal</div>
        </div>

        <nav className="vb-navwrap">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="vb-group">{g.title}</div>
              {g.items.map((it) => <NavLink key={it.href} it={it} />)}
            </div>
          ))}
        </nav>

        <div className="vb-bottom">
          <LangMenu />
          <a href="/vidyarthi/settings" className={`vb-nav${pathname === "/vidyarthi/settings" ? " active" : ""}`}><Icon name="settings" /><span className="vb-nav-t">Settings</span></a>
          <a href="/vidyarthi/help" className={`vb-nav${pathname === "/vidyarthi/help" ? " active" : ""}`}><Icon name="lifebuoy" /><span className="vb-nav-t">Help</span></a>
          <button className="vb-nav vb-logout" onClick={logout}><Icon name="logout" /><span className="vb-nav-t">Log out</span></button>
          <div className="vb-user">
            <div className="vb-avatar">{(name || "V").trim().charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ color: "var(--saffron-deep)", fontSize: 11 }}>VIDYA BHARATI</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="vb-content">{children}</main>
    </div>
  );
}

export default function VidyarthiLayout({ children }) {
  return (
    <LanguageProvider>
      <Shell>{children}</Shell>
    </LanguageProvider>
  );
}
