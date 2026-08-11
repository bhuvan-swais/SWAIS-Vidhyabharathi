import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../api";
import { C, Btn } from "../ui";

const ROLES = ["Vidyarthi", "Acharya", "Palaka", "Pradhana Acharya", "Nyasa"];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Vidyarthi");
  const [loading, setLoading] = useState(false);

  async function go(demo) {
    setLoading(true);
    try {
      await login(demo ? "" : email, role);
      navigation.replace("Main");
    } catch (e) {
      Alert.alert("Sign in failed", e.message);
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: C.ink }}>SWAIS</Text>
        <Text style={{ color: C.saffronDeep, fontWeight: "700", letterSpacing: 1, marginBottom: 24 }}>VidhyaBharathi · विद्या भारती</Text>
        <Text style={{ fontSize: 32, fontWeight: "800", color: C.saffronDeep, marginBottom: 24 }}>स्वागतम्</Text>

        <Text style={s.label}>Email (optional for demo)</Text>
        <TextInput style={s.input} placeholder="you@school.in" autoCapitalize="none"
          keyboardType="email-address" value={email} onChangeText={setEmail} />

        <Text style={[s.label, { marginTop: 14 }]}>Role</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {ROLES.map((r) => (
            <Text key={r} onPress={() => setRole(r)}
              style={[s.chip, role === r && { backgroundColor: C.saffron, color: "#fff", borderColor: C.saffron }]}>{r}</Text>
          ))}
        </View>

        <Btn label={loading ? "Please wait…" : "आगे बढ़ें · Continue"} primary disabled={loading} onPress={() => go(false)} style={{ marginTop: 26 }} />
        <Btn label="Continue as demo student" disabled={loading} onPress={() => go(true)} style={{ marginTop: 10 }} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  label: { fontWeight: "700", color: C.ink, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 14, backgroundColor: "#fff", fontSize: 16 },
  chip: { borderWidth: 1.5, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff", color: C.copy, fontWeight: "600", overflow: "hidden" },
});
