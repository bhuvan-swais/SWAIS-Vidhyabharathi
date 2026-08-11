import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LanguageProvider } from "./src/context/LanguageContext";
import { getToken } from "./src/lib/token";
import { C } from "./src/ui";

import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ChaptersScreen from "./src/screens/ChaptersScreen";
import AssignmentsScreen from "./src/screens/AssignmentsScreen";
import QuizzesScreen from "./src/screens/QuizzesScreen";
import MoreScreen from "./src/screens/MoreScreen";
import StudyMaterialScreen from "./src/screens/StudyMaterialScreen";
import AssessmentsScreen from "./src/screens/AssessmentsScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import AiLearningPathScreen from "./src/screens/AiLearningPathScreen";
import AiTranslatorScreen from "./src/screens/AiTranslatorScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import HelpScreen from "./src/screens/HelpScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (emoji) => ({ color }) => <Text style={{ fontSize: 18, color }}>{emoji}</Text>;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.saffronDeep,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: "#FFF3E6", borderTopColor: C.line, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: "Home", tabBarIcon: tabIcon("🏠") }} />
      <Tab.Screen name="Chapters" component={ChaptersScreen} options={{ tabBarIcon: tabIcon("📖") }} />
      <Tab.Screen name="Assignments" component={AssignmentsScreen} options={{ tabBarLabel: "Tasks", tabBarIcon: tabIcon("📝") }} />
      <Tab.Screen name="Quizzes" component={QuizzesScreen} options={{ tabBarIcon: tabIcon("❓") }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ tabBarIcon: tabIcon("☰") }} />
    </Tab.Navigator>
  );
}

const detail = { headerShown: true, headerStyle: { backgroundColor: "#FFF3E6" }, headerTintColor: C.ink, headerTitleStyle: { color: C.ink } };

export default function App() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => { (async () => { setSignedIn(!!(await getToken())); setReady(true); })(); }, []);

  if (!ready) {
    return <View style={{ flex: 1, justifyContent: "center", backgroundColor: C.cream }}><ActivityIndicator color={C.saffronDeep} /></View>;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator initialRouteName={signedIn ? "Main" : "Login"}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="StudyMaterial" component={StudyMaterialScreen} options={{ ...detail, title: "Study Material" }} />
            <Stack.Screen name="Assessments" component={AssessmentsScreen} options={{ ...detail, title: "Assessments" }} />
            <Stack.Screen name="Progress" component={ProgressScreen} options={{ ...detail, title: "Progress" }} />
            <Stack.Screen name="AiLearningPath" component={AiLearningPathScreen} options={{ ...detail, title: "AI Learning Path" }} />
            <Stack.Screen name="AiTranslator" component={AiTranslatorScreen} options={{ ...detail, title: "AI Translator" }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ ...detail, title: "Settings" }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ ...detail, title: "Help" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
