"use client";

import { useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("vb_acharya_token");
  const schoolId = localStorage.getItem("vb_school_id");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-school-id": schoolId
  };
}

const LANGUAGES = [
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

export default function TranslatorPage() {
  const [inputText,   setInputText]   = useState("");
  const [outputText,  setOutputText]  = useState("");
  const [sourceLang,  setSourceLang]  = useState("en");
  const [targetLang,  setTargetLang]  = useState("hi");
  const [isLoading,   setIsLoading]   = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [charCount,   setCharCount]   = useState(0);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);

  const MAX_CHARS = 1000;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setInputText(val);
    setCharCount(val.length);
    if (!val.trim()) setOutputText("");
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
    setCharCount(outputText.length);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setOutputText("");
    try {
      const targetLabel = LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;
      const res = await fetch(`${API}/api/v1/translate/text`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text: inputText, targetLanguage: targetLabel }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOutputText(data.translatedText ?? data.translated_text ?? data.translation ?? data.result ?? JSON.stringify(data));
    } catch {
      setOutputText("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicInput = async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(",")[1];
          const langLabel = LANGUAGES.find(l => l.code === sourceLang)?.label || "English";
          try {
            const res = await fetch(`${API}/api/v1/speech/to-text`, {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify({ audioFile: base64, language: langLabel }),
            });
            const data = await res.json();
            const text = data.text ?? data.transcript ?? data.result ?? "";
            if (text) { setInputText(text); setCharCount(text.length); }
          } catch { /* silent fail */ }
          setIsListening(false);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
      setTimeout(() => mediaRecorderRef.current?.stop(), 6000);
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!outputText || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const lang = LANGUAGES.find(l => l.code === targetLang);
    const utt = new SpeechSynthesisUtterance(outputText);
    utt.lang = targetLang;
    window.speechSynthesis.speak(utt);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in font-inter">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-gradient-to-r from-orange-500 to-amber-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            अनुवादकः <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">(Translator)</span>
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            Translate teaching content across Indian languages
          </p>
        </div>
        <span className="ml-auto text-[10px] font-extrabold px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm uppercase tracking-widest">
          AI Connected
        </span>
      </div>

      {/* Language Selector Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-4 flex-wrap border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-extrabold uppercase tracking-wide block mb-1.5 text-gray-500 dark:text-gray-400">From</label>
          <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
            className="w-full text-sm font-bold rounded-xl px-4 py-3 outline-none cursor-pointer border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <button onClick={handleSwapLanguages}
          className="mt-5 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-100 dark:border-orange-500/20"
          title="Swap languages">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-extrabold uppercase tracking-wide block mb-1.5 text-gray-500 dark:text-gray-400">To</label>
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
            className="w-full text-sm font-bold rounded-xl px-4 py-3 outline-none cursor-pointer border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all">
            {LANGUAGES.filter(l => l.code !== sourceLang).map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Translation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Input */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {LANGUAGES.find(l => l.code === sourceLang)?.label}
            </span>
            <span className={`text-[10px] font-bold ${charCount > MAX_CHARS * 0.9 ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste text to translate..."
            className="w-full p-5 text-sm font-medium resize-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 flex-1"
            style={{ minHeight: "240px" }}
          />
          <div className="px-5 pb-5 flex gap-3 mt-auto">
            <button onClick={handleMicInput}
              title={isListening ? "Stop recording" : "Speak to fill input"}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm ${isListening ? "bg-red-500 text-white" : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-100 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/30"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V4a3 3 0 00-3-3H9" />
              </svg>
            </button>
            <button onClick={handleTranslate}
              disabled={!inputText.trim() || isLoading}
              className={`flex-1 py-3 rounded-xl text-sm font-extrabold transition-all shadow-sm ${
                !inputText.trim() || isLoading 
                ? "bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white cursor-not-allowed border border-gray-200 dark:border-white/5" 
                : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white cursor-pointer"
              }`}>
              {isLoading ? "Translating…" : "Translate →"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border shadow-sm flex flex-col ${outputText ? "border-orange-200 dark:border-orange-500/50" : "border-gray-100 dark:border-gray-800"}`}>
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {LANGUAGES.find(l => l.code === targetLang)?.label}
            </span>
            <div className="flex items-center gap-2">
              {outputText && (
                <>
                  <button onClick={handleSpeak} title="Listen"
                    className="p-2 rounded-lg transition-colors cursor-pointer text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3" />
                    </svg>
                  </button>
                  <button onClick={handleCopy} title="Copy"
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${copied ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/30" : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-100 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20"}`}>
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-5 flex-1 flex items-start">
            {isLoading ? (
              <div className="flex flex-col gap-3 w-full pt-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border-4 border-orange-200 dark:border-orange-900 border-t-orange-600 dark:border-t-orange-500 animate-spin" />
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Translating…</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-3/5 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ) : outputText ? (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {outputText}
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-400 dark:text-gray-600 mt-2">
                Translation will appear here…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}