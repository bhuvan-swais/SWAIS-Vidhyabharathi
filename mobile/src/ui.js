// Shared UI kit for the Vidyarthi mobile app — saffron theme + small building
// blocks so every screen stays short and consistent.
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const C = {
  cream: "#FFF9F0", card: "#FFFFFF", ink: "#2B1A0F", muted: "#B08A5C",
  line: "#F0E3D2", saffron: "#F28C28", saffronDeep: "#C0562A", soft: "#FCE7D2",
  copy: "#6F5B45",
};

export function Screen({ title, sk, children, refreshing, onRefresh }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {(title || sk) && (
          <View style={{ marginBottom: 14 }}>
            {sk ? <Text style={s.h1}>{sk}</Text> : null}
            {title ? <Text style={s.h1en}>{title}</Text> : null}
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Pill({ label, on }) {
  return (
    <View style={[s.pill, on && { backgroundColor: C.saffron }]}>
      <Text style={[s.pillT, on && { color: "#fff" }]}>{label}</Text>
    </View>
  );
}

export function Btn({ label, onPress, primary, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      style={[s.btn, primary && { backgroundColor: C.saffron, borderColor: C.saffron }, disabled && { opacity: 0.5 }, style]}>
      <Text style={[s.btnT, primary && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Muted({ children, style }) { return <Text style={[{ color: C.muted }, style]}>{children}</Text>; }
export function Loading() { return <ActivityIndicator color={C.saffronDeep} style={{ marginTop: 20 }} />; }

export function Stat({ value, sk, en }) {
  return (
    <Card style={{ flex: 1, minWidth: 100 }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: C.saffronDeep }}>{value}</Text>
      {sk ? <Text style={{ fontWeight: "700", color: C.ink, marginTop: 2 }}>{sk}</Text> : null}
      <Muted style={{ fontSize: 12 }}>{en}</Muted>
    </Card>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "800", color: C.ink },
  h1en: { fontSize: 15, color: C.muted, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  pill: { backgroundColor: C.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start" },
  pillT: { color: C.saffronDeep, fontWeight: "700", fontSize: 12 },
  btn: { borderWidth: 1.5, borderColor: C.line, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center" },
  btnT: { color: C.ink, fontWeight: "700" },
});
