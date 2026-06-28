import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RusCity Life RP — GTA 5 Roleplay Forum",
  description: "Официальный форум сервера RusCity Life RP. GTA 5 Roleplay проект.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#0a0a12] text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-60px)]">{children}</main>
          <footer className="bg-[#0d0d14] border-t border-[#1e1e2e] py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="text-orange-400 font-bold text-lg mb-1">RusCity Life RP</div>
              <div className="text-gray-600 text-sm">© 2024 RusCity Life RP. GTA 5 Roleplay Server. Все права защищены.</div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
