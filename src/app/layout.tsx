import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import StoreProvider from "@/components/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Engine — Produção de Conteúdo Viral",
  description: "Plataforma de produção de conteúdo viral para múltiplas marcas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <StoreProvider>
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <div className="p-8 page-enter">{children}</div>
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
