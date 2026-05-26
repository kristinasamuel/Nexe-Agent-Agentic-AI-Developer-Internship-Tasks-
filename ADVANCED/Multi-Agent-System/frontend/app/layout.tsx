import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MultiMind AI | Advanced Multi-Agent Intelligence",
  description: "Experience the next generation of AI with MultiMind, a sophisticated multi-agent system designed for complex problem solving and autonomous coordination.",
  keywords: ["AI", "Multi-Agent System", "Autonomous Agents", "MultiMind", "Artificial Intelligence", "Neural Hub"],
  authors: [{ name: "Kristina Agentic AI Developer" }],
  openGraph: {
    title: "MultiMind AI",
    description: "Sophisticated multi-agent system for complex tasks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
