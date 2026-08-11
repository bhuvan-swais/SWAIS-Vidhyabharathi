// AI service client — ported from the demo Student-Dashboard.
// Points at the stateless AI microservice. Base URL is configurable so we can
// swap the endpoint per environment without touching pages.
const BASE_URL = (process.env.NEXT_PUBLIC_AI_BASE_URL || "http://16.112.236.67:7008/api/v1/student").replace(/\/+$/, "");

const translationCache = {};

async function postData(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`AI error in ${endpoint}:`, error);
    return null;
  }
}

// 1. Content generation
export const generateContent = (topic, capacity = "Average") =>
  postData("/content/generate", { topic, learning_capacity: capacity });

// 2. Quiz generation
export const generateQuiz = (subject, difficulty = "Medium", numQuestions = 5) =>
  postData("/quiz/generate", { topic: subject, difficulty, num_questions: numQuestions });

// 3. Quiz evaluation
export const evaluateQuiz = (submissionData) =>
  postData("/quiz/evaluate", { submission_data: submissionData });

// 4. Translate (with in-memory cache for instant repeat lookups)
export const translateText = async (text, lang) => {
  const cacheKey = `${lang}_${text}`;
  if (translationCache[cacheKey]) return { translated_text: translationCache[cacheKey] };
  const response = await postData("/translate", { text, target_language: lang });
  if (response) {
    const finalString = response.translated_text || response.text || response.data;
    if (finalString) translationCache[cacheKey] = finalString;
  }
  return response;
};

// 5. Voice to text
export const voiceToText = async (audioBlob, language = "English") => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("language", language);
  try {
    const response = await fetch(`${BASE_URL}/voice-to-text`, { method: "POST", body: formData });
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Voice to Text Error:", error);
    return null;
  }
};

// 6. Text to voice -> returns a playable data: URL
export const textToVoice = async (text, language = "English") => {
  try {
    const response = await fetch(`${BASE_URL}/text-to-voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) throw new Error("Text to voice failed");
    const data = await response.json();
    if (data && data.audio_base64) return `data:audio/mp3;base64,${data.audio_base64}`;
    return null;
  } catch (error) {
    console.error("Text-to-Voice Error:", error);
    return null;
  }
};
