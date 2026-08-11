import { View, Text, TouchableOpacity } from "react-native";
import { clearToken } from "../lib/token";
import { Screen, Card, C } from "../ui";

const ITEMS = [
  { icon: "📊", label: "Progress", sk: "प्रगति", to: "Progress" },
  { icon: "📋", label: "Assessments", sk: "परीक्षा", to: "Assessments" },
  { icon: "📚", label: "Study Material", sk: "अध्ययन", to: "StudyMaterial" },
  { icon: "✨", label: "AI Learning Path", sk: "एआई पथ", to: "AiLearningPath" },
  { icon: "🌐", label: "AI Translator", sk: "अनुवादक", to: "AiTranslator" },
  { icon: "⚙️", label: "Settings", sk: "सेटिंग्स", to: "Settings" },
  { icon: "❔", label: "Help", sk: "सहायता", to: "Help" },
];

export default function MoreScreen({ navigation }) {
  async function logout() { await clearToken(); navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] }); }
  return (
    <Screen sk="अधिक" title="More">
      <Card style={{ padding: 0 }}>
        {ITEMS.map((it, i) => (
          <TouchableOpacity key={it.to} onPress={() => navigation.navigate(it.to)}
            style={{ flexDirection: "row", alignItems: "center", padding: 15, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
            <Text style={{ fontSize: 18, width: 30 }}>{it.icon}</Text>
            <Text style={{ flex: 1, color: C.ink, fontWeight: "600" }}><Text style={{ color: C.saffronDeep }}>{it.sk}</Text> · {it.label}</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>
      <TouchableOpacity onPress={logout} style={{ padding: 15 }}>
        <Text style={{ color: C.saffronDeep, fontWeight: "700" }}>⎋  Log out</Text>
      </TouchableOpacity>
    </Screen>
  );
}
