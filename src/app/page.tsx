"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1787044/pexels-photo-1787044.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/50 via-[#0a0a12]/80 to-[#0a0a12]" />

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Сервер онлайн
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-none">
            RusCity{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Life RP
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Официальный форум лучшего GTA 5 Roleplay сервера
          </p>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Обсуждай игровые события, участвуй в жизни города, общайся с другими
            игроками и следи за новостями сервера.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/forum"
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/30 text-lg"
            >
              Открыть форум
            </Link>
            {!user && (
              <button
                onClick={() => {
                  setAuthTab("register");
                  setShowAuth(true);
                }}
                className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-lg"
              >
                Зарегистрироваться
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: "🏙️", label: "Название сервера", value: "RusCity Life RP" },
            { icon: "🎮", label: "Игра", value: "GTA 5 Roleplay" },
            { icon: "🌐", label: "Язык", value: "Русский" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6 text-center hover:border-orange-500/30 transition-colors"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="text-white font-bold text-xl">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Возможности форума
          </h2>
          <p className="text-gray-400">Всё необходимое для общения игроков RusCity Life RP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "💬",
              title: "Разделы и темы",
              desc: "Структурированный форум с категориями, подразделами и темами для удобного общения",
            },
            {
              icon: "👤",
              title: "Профили игроков",
              desc: "Персонализируй свой профиль: аватарка, баннер, никнейм и описание",
            },
            {
              icon: "🎖️",
              title: "Роли и статусы",
              desc: "Система ролей: Администратор, Модератор, Хелпер, VIP и обычный игрок",
            },
            {
              icon: "⚖️",
              title: "Модерация",
              desc: "Инструменты мута и бана для поддержания порядка на форуме",
            },
            {
              icon: "📱",
              title: "Адаптивный дизайн",
              desc: "Форум работает на всех устройствах: ПК, планшет и смартфон",
            },
            {
              icon: "🔐",
              title: "Безопасность",
              desc: "Надёжная система авторизации с шифрованием паролей",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6 hover:border-orange-500/30 transition-colors group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showAuth && (
        <AuthModal initialTab={authTab} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
