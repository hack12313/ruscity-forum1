"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setBanner(user.banner || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Необходима авторизация</h2>
        <Link href="/forum" className="text-orange-400 hover:underline">
          Вернуться на форум
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatar, banner }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await refreshUser();
      setSuccess("Профиль успешно обновлён!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-400 transition-colors">Главная</Link>
        <span>/</span>
        <Link href={`/profile/${user.username}`} className="hover:text-orange-400 transition-colors">
          Профиль
        </Link>
        <span>/</span>
        <span className="text-gray-300">Редактировать</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-8">
        ✏️ Редактировать профиль
      </h1>

      {/* Preview */}
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden mb-8">
        <div
          className="h-32 bg-gradient-to-r from-orange-500/20 to-red-600/20 relative"
          style={
            banner
              ? {
                  backgroundImage: `url(${banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131f]/50 to-transparent" />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3">
            {avatar ? (
              <img
                src={avatar}
                alt="Аватар"
                className="w-16 h-16 rounded-xl object-cover border-4 border-[#13131f]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-2xl border-4 border-[#13131f]">
                {(displayName || user.username)[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="text-white font-bold">{displayName || user.username}</div>
          <div className="text-gray-500 text-sm">@{user.username}</div>
          {bio && <p className="text-gray-400 text-sm mt-1">{bio}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display name */}
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>👤</span> Основная информация
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                Никнейм (отображаемое имя)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ваш никнейм"
                maxLength={80}
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <div className="text-gray-600 text-xs mt-1">
                Логин (@{user.username}) изменить нельзя.
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                О себе
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите о себе..."
                rows={4}
                maxLength={500}
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
              <div className="text-gray-600 text-xs mt-1 text-right">
                {bio.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🖼️</span> Аватарка
          </h2>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
              URL аватарки
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-gray-600 text-xs mt-2">
              Вставьте прямую ссылку на изображение (JPEG, PNG, WebP). Рекомендуемый размер: 200×200 px.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Можно использовать: imgur.com, postimages.org, uploadcare.com
            </p>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🎨</span> Баннер профиля
          </h2>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
              URL баннера
            </label>
            <input
              type="url"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-gray-600 text-xs mt-2">
              Рекомендуемый размер: 1200×300 px. Поддерживаются те же сервисы, что и для аватарки.
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            ✅ {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Сохраняем..." : "Сохранить изменения"}
          </button>
          <Link
            href={`/profile/${user.username}`}
            className="px-8 py-3 bg-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/20 transition-colors"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
