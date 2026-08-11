// Multi-language context for mobile (same as web). selectedLanguage is the NAME
// ("English", "Hindi", ...) passed straight to the AI translate/tts endpoints.
import React, { createContext, useContext, useState } from "react";

const Ctx = createContext();

export const LANGUAGES = [
  { code: "en", name: "English" }, { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" }, { code: "kn", name: "Kannada" },
  { code: "ta", name: "Tamil" }, { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" }, { code: "ml", name: "Malayalam" },
];

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  return (
    <Ctx.Provider value={{ selectedLanguage, changeLanguage: setSelectedLanguage, LANGUAGES }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLanguage = () => useContext(Ctx);
