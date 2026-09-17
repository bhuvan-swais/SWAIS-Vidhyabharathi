"use client";

import { useState } from "react";
import { Moon, Sun, Sparkles, LogOut, Globe } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setShowAITools: (value: boolean) => void;
}

export default function Header({
  darkMode,
  setDarkMode,
  setShowAITools,
}: HeaderProps) {
  const [language, setLanguage] = useState("English");

  const translations: Record<string, Record<string, string>> = {
    English: {
      dashboard: "Dashboard",
      schoolIntelligence: "School Intelligence",
      aiTools: "AI Tools",
      logout: "Logout",
    },
    Telugu: {
      dashboard: "డాష్‌బోర్డ్",
      schoolIntelligence: "పాఠశాల సమాచారం",
      aiTools: "AI సాధనాలు",
      logout: "లాగ్ అవుట్",
    },
    Hindi: {
      dashboard: "डैशबोर्ड",
      schoolIntelligence: "विद्यालय जानकारी",
      aiTools: "AI टूल्स",
      logout: "लॉग आउट",
    },
  };

  const t = translations[language];

  const handleLogout = () => {
    window.location.href = "https://staging.vb.swais.in/";
  };

  return (
    <header className="top-header">

      <div className="header-left">
        <div>
          <span className="header-label">
            VIDHYABHARATHI
          </span>

          <h1>
            {t.dashboard}
          </h1>
        </div>
      </div>

      <div className="header-actions">

        {/* LANGUAGE */}
        <div className="language-wrapper">

          <Globe size={18} />

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="English">English</option>
            <option value="Telugu">తెలుగు</option>
            <option value="Hindi">हिन्दी</option>
          </select>

        </div>

        {/* AI TOOLS */}
        <button
          className="header-icon-button"
          onClick={() => setShowAITools(true)}
          title={t.aiTools}
        >
          <Sparkles size={19} />
        </button>

        {/* DARK MODE */}
        <button
          className="header-icon-button"
          onClick={() => setDarkMode(!darkMode)}
          title="Theme"
        >
          {darkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* LOGOUT */}
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>

      </div>

    </header>
  );
}