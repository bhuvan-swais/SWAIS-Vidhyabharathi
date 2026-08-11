"use client";
// AI Translator — translate text into the selected language + play it aloud.
import { useState } from "react";
import { translateText, textToVoice } from "../../../lib/aiService";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function AiTranslatorPage() {
  const { selectedLanguage } = useLanguage();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [translating, setTranslating] = useState(false);
  const [playing, setPlaying] = useState(false);

  async function translate() {
    if (!input.trim()) return;
    setTranslating(true); setOutput("");
    try {
      const res = await translateText(input, selectedLanguage);
      setOutput(res?.translated_text || res?.text || (typeof res === "string" ? res : "") || "Translation failed. Please try again.");
    } finally { setTranslating(false); }
  }

  async function play() {
    if (!output.trim()) return;
    setPlaying(true);
    try {
      const url = await textToVoice(output, selectedLanguage);
      if (url) await new Audio(url).play();
    } finally { setPlaying(false); }
  }

  return (
    <>
      <h1 style={{ fontSize: 26 }}><span className="dev">एआई अनुवादक</span> · AI Translator</h1>
      <p style={{ color: "var(--muted)", marginTop: 4 }}>Translating into <b>{selectedLanguage}</b> (change it in the top bar).</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginTop: 16 }}>
        <div className="vb-card">
          <label style={{ fontWeight: 600 }}>Text to translate</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={7} placeholder="Type or paste text…"
            style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 12, border: "1px solid var(--line)", fontFamily: "inherit" }} />
          <button className="vb-btn" style={{ marginTop: 12, background: "var(--saffron)", color: "#fff", width: "100%" }} onClick={translate} disabled={translating}>
            {translating ? "Translating…" : `Translate to ${selectedLanguage}`}
          </button>
        </div>

        <div className="vb-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: 600 }}>Translation ({selectedLanguage})</label>
            {output && <button className="vb-btn" onClick={play} disabled={playing} title="Listen">{playing ? "⏳" : "🔊"}</button>}
          </div>
          <div style={{ minHeight: 150, marginTop: 8, padding: 12, borderRadius: 12, background: "var(--saffron-soft)", color: "var(--ink)", whiteSpace: "pre-wrap" }}>
            {output || <span style={{ color: "var(--muted)" }}>Translation will appear here…</span>}
          </div>
        </div>
      </div>
    </>
  );
}
