import type { Metadata } from "next";
import { Space_Grotesk, Teko } from "next/font/google";
import "./globals.css";

const heading = Teko({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Fan Experience AI Assistant",
  description:
    "Sporty F1 fan assistant PWA and admin operations dashboard scope.",
  applicationName: "F1 Fan Experience",
  themeColor: "#0b0d10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink text-ice">{children}</body>
    </html>
  );
}
