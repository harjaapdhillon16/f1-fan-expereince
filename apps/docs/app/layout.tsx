import type { Metadata } from "next";
import { Manrope, Rajdhani } from "next/font/google";
import "./globals.css";

const opsHeading = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ops-heading",
  display: "swap",
});

const opsBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ops-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Fan Experience Admin Ops",
  description: "Operations dashboard for live fan experience control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${opsHeading.variable} ${opsBody.variable}`}>
      <body className="min-h-screen bg-opsink text-opsfog">{children}</body>
    </html>
  );
}
