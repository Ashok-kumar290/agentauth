import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgentAuth | Authorization Layer for AI Agent Payments",
  description: "The authorization layer for AI agent payments. Let AI agents buy for you with full control, audit trails, and sub-100ms authorization.",
  keywords: ["AI agents", "payments", "authorization", "fintech", "API"],
  authors: [{ name: "AgentAuth" }],
  openGraph: {
    title: "AgentAuth | Authorization Layer for AI Agent Payments",
    description: "Let AI agents buy for you with full control and sub-100ms authorization.",
    url: "https://agentauth.in",
    siteName: "AgentAuth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentAuth | Authorization Layer for AI Agent Payments",
    description: "Let AI agents buy for you with full control and sub-100ms authorization.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
