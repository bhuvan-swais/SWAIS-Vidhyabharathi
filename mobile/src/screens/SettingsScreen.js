import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { apiGet } from "../api";
import { clearToken } from "../lib/token";
import { useLanguage } from "../context/LanguageContext";
import { Screen, Card, Btn, Muted, C } from "../ui";

export default function SettingsScreen({ navigation }) {
  const { selectedLanguage, changeLanguage, LANGUAGES } = useLanguage();
  const [st, setSt] = useState(null);

  useEffect(() => { apiGet("/students/current").then((d) => setSt(d?.student || null)).catch(() => {}); }, []);
  async function logout() { await clearToken(); navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] }); }

  const rows = st ? [["Name", st.full_name], ["Admission No", st.admission_no], ["Class", String(st.class_id)], ["Section", st.section], ["Roll No", st.roll_no], ["Email", st.email_id || "—"]] : [];

  return (
    <Screen>
      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginBottom: 8 }}>Profile</Text>
      <Card>
        {!st ? <Muted>Loading…</Muted> : rows.map(([k, v]) => (
          <View key={k} style={{ flexDirection: "row", paddingVertical: 7 }}>
            <Text style={{ width: 120, color: C.muted }}>{k}</Text>
            <Text style={{ flex: 1, fontWeight: "600", color: C.ink }}>{v}</Text>
          </View>
        ))}
      </Card>

      <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink, marginTop: 12, marginBottom: 8 }}>Preferred language</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity key={l.code} onPress={() => changeLanguage(l.name)}
            style={{ borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8, backgroundColor: selectedLanguage === l.name ? C.saffron : C.soft }}>
            <Text style={{ color: selectedLanguage === l.name ? "#fff" : C.saffronDeep, fontWeight: "700", fontSize: 13 }}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Btn label="Log out" primary onPress={logout} style={{ alignSelf: "flex-start", backgroundColor: C.saffronDeep, borderColor: C.saffronDeep }} />
    </Screen>
  );
}
