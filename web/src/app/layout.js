import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
// ADDED: Import the newly created I18nProvider
import I18nProvider from "@/context/I18nProvider"; 

const inter = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  // UPDATED: Rebranded to VBK Faculty!
  title: "VBK Faculty! — AI-Powered Faculty Portal",
  description: "Bringing AI into every classroom. Manage notes, assessments, and student insights with VBK Faculty!.",
  keywords: ["AI in Schools", "EdTech", "Teacher Portal", "VBK Faculty!"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${body.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {/* ADDED: Wrap children with the translation provider */}
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}