import { Text } from "react-native";
import { Screen, Card, C } from "../ui";

const FAQ = [
  ["How do I submit an assignment?", "Open Assignments (Tasks tab), tap Submit on a card, type your answer, and press Send. Marks and remarks appear once graded."],
  ["How do quizzes work?", "Open Quizzes, pick one, tap Take. Questions are AI-generated; answer all, submit, and your score is saved automatically."],
  ["What is the AI Learning Path?", "Enter your recent learning signals; we classify your reading style and build a personalized study plan."],
  ["Can I read content in my language?", "Yes — pick a language in the Translator or Settings. Assignments and text can be translated on the fly."],
  ["Where do I see my progress?", "The Progress screen (in More) shows exam marks and past quiz scores."],
];

export default function HelpScreen() {
  return (
    <Screen>
      {FAQ.map(([q, a]) => (
        <Card key={q}>
          <Text style={{ fontWeight: "700", color: C.ink }}>{q}</Text>
          <Text style={{ color: C.copy, marginTop: 6 }}>{a}</Text>
        </Card>
      ))}
    </Screen>
  );
}
