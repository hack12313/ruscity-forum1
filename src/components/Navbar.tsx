"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleBadgeColor, getRoleLabel } from "@/lib/utils";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setAuthTab("login");
    setShowAuth(true);
  };

  const handleRegisterClick = () => {
    setAuthTab("register");
    setShowAuth(true);
  };

  return (
    <>
      <nav className="bg-[#0d0d14] border-b border-[#1e1e2e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
              R
            </div>
            <div>
              <div className="text-white font-black text-lg leading-none tracking-wide">
                RusCity Life RP
              </div>
              <div className="text-orange-400 text-xs font-medium">GTA 5 Roleplay Forum</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Главная
            </Link>
            <Link href="/forum" className="text-gray-300 hover:text-white transition-colors">
              Форум
            </Link>
            {user && (user.role === "admin" || user.role === "moderator") && (
              <Link href="/admin" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                Админ-панель
              </Link>
            )}
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover border-2 border-orange-500/50"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm border-2 border-orange-500/50">
                      {(user.displayName || user.username)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="text-white text-sm font-medium leading-none">
                      {user.displayName || user.username}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#2a2a3e]">
                      <div className="text-white font-medium text-sm">
                        {user.displayName || user.username}
                      </div>
                      <div className="text-gray-400 text-xs">@{user.username}</div>
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                    >
                      <span>👤</span> Мой профиль
                    </Link>
                    <Link
                      href="/profile/edit"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                    >
                      <span>✏️</span> Редактировать профиль
                    </Link>
                    {(user.role === "admin" || user.role === "moderator") && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-orange-400 hover:text-orange-300 hover:bg-white/5 text-sm transition-colors"
                      >
                        <span>⚙️</span> Админ-панель
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 text-sm transition-colors"
                    >
                      <span>🚪</span> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Войти
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          initialTab={authTab}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
