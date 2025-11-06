// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/common/Header";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import PageTransition from "@/components/common/PageTransition";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import SimpleChatWidget from "@/components/chat/SimpleChatWidget";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "PeerFusion - Collaborative Research & Skill-Sharing Platform",
  description: "Connect with researchers, share skills, collaborate on projects, and advance your academic career. Join PeerFusion to find collaborators and share knowledge.",
  keywords: "research collaboration, skill sharing, academic networking, project collaboration, peer learning, research platform",
  authors: [{ name: "PeerFusion Team" }],
  openGraph: {
    title: "PeerFusion - Collaborative Research Platform",
    description: "Connect, collaborate, and share knowledge with researchers worldwide",
    type: "website",
    locale: "en_US",
    siteName: "PeerFusion",
  },
  twitter: {
    card: "summary_large_image",
    title: "PeerFusion - Research Collaboration Platform",
    description: "Connect with researchers and share your expertise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <ErrorBoundary>
                <AnimatedBackground />
                <div className="relative min-h-screen">
                  <Header />
                  <main className="w-full pt-16">
                    <PageTransition>{children}</PageTransition>
                  </main>
                </div>
                <SimpleChatWidget />
              </ErrorBoundary>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
