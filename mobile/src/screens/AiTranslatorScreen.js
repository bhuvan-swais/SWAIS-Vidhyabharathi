import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { translateText } from "../aiService";
import { useLanguage } from "../context/LanguageContext";
import { Screen, Card, Btn, Muted, C } from "../ui";

export default function AiTranslatorScreen() {
  const { selectedLanguage, changeLanguage, LANGUAGES } = useLanguage();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  async function translate() {
    if (!input.trim()) return;
    setBusy(true); setOutput("");
    try {
      const r = await translateText(input, selectedLanguage);
      setOutput(r?.translated_text || r?.text || (typeof r === "string" ? r : "") || "Translation failed. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <Screen>
      <Muted style={{ marginBottom: 10 }}>Translating into {selectedLanguage}.</Muted>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity key={l.code} onPress={() => changeLanguage(l.name)}
            style={{ borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8, backgroundColor: selectedLanguage === l.name ? C.saffron : C.soft }}>
            <Text style={{ color: selectedLanguage === l.name ? "#fff" : C.saffronDeep, fontWeight: "700", fontSize: 13 }}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card>
        <Text style={{ fontWeight: "700", color: C.ink, marginBottom: 8 }}>Text to translate</Text>
        <TextInput value={input} onChangeText={setInput} placeholder="Type or paste text…" multiline
          style={{ borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: "top" }} />
        <Btn label={busy ? "Translating…" : `Translate to ${selectedLanguage}`} primary disabled={busy} onPress={translate} style={{ marginTop: 12 }} />
      </Card>

      <Card>
        <Text style={{ fontWeight: "700", color: C.ink, marginBottom: 8 }}>Translation ({selectedLanguage})</Text>
        <Text style={{ minHeight: 80, color: output ? C.ink : C.muted, padding: 12, backgroundColor: C.soft, borderRadius: 12 }}>
          {output || "Translation will appear here…"}
        </Text>
      </Card>
    </Screen>
  );
}
