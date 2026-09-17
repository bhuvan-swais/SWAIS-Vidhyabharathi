import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SWAIS | Pradhana Acharya Dashboard",
  description:
    "VidhyaBharathi School Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body>
        {children}
      </body>

    </html>
  );
}