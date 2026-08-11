// AI service client for mobile — same stateless AI microservice as web.
import Constants from "expo-constants";

const BASE = (Constants.expoConfig?.extra?.aiBaseUrl || "http://16.112.236.67:7008/api/v1/student").replace(/\/+$/, "");
const cache = {};

async function postData(endpoint, data) {
  try {
    const r = await fetch(`${BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`AI ${r.status}`);
    return await r.json();
  } catch (e) { console.warn("AI error", endpoint, e.message); return null; }
}

export const generateContent = (topic, capacity = "Average") =>
  postData("/content/generate", { topic, learning_capacity: capacity });

export const generateQuiz = (subject, difficulty = "Medium", numQuestions = 5) =>
  postData("/quiz/generate", { topic: subject, difficulty, num_questions: numQuestions });

export const translateText = async (text, lang) => {
  const key = `${lang}_${text}`;
  if (cache[key]) return { translated_text: cache[key] };
  const res = await postData("/translate", { text, target_language: lang });
  if (res) { const t = res.translated_text || res.text || res.data; if (t) cache[key] = t; }
  return res;
};

export const textToVoice = async (text, language = "English") => {
  try {
    const r = await fetch(`${BASE}/text-to-voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!r.ok) throw new Error("tts");
    const d = await r.json();
    return d?.audio_base64 ? `data:audio/mp3;base64,${d.audio_base64}` : null;
  } catch { return null; }
};
