"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  initialTab: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ initialTab, onClose }: AuthModalProps) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const router = useRouter();

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginUsername, loginPassword);
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(regUsername, regEmail, regPassword, regConfirm);
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#13131f] border border-[#2a2a3e] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-b border-[#2a2a3e] px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
              R
            </div>
            <div>
              <div className="text-white font-bold text-lg">RusCity Life RP</div>
              <div className="text-gray-400 text-xs">GTA 5 Roleplay Forum</div>
            </div>
          </div>
          <div className="flex gap-1 bg-[#1a1a2e] rounded-lg p-1">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === "login"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === "register"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Логин
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Ваш логин"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Пароль
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Ваш пароль"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Входим..." : "Войти на форум"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Логин
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Только латинские буквы, цифры и _"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Пароль
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Повторите пароль
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Регистрируем..." : "Зарегистрироваться"}
              </button>
            </form>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
