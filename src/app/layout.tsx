import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AudioPlayer } from "@/components/player/audio-player";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VozLibro",
  description: "Convierte tus libros en audiolibros con voces IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col md:flex-row overflow-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-32 md:pb-24 bg-background">
            {children}
          </main>
          <AudioPlayer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
