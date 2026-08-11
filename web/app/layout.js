import "./globals.css";

export const metadata = {
  title: "SWAIS VidhyaBharathi",
  description: "AI-enabled holistic learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
