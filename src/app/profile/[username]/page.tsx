"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDateShort, getRoleBadgeColor, getRoleLabel, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  postCount: number;
  isMuted: boolean;
  isBanned: boolean;
  mutedUntil: string | null;
  muteReason: string | null;
  banReason: string | null;
  createdAt: string;
}

interface RecentPost {
  id: number;
  topicId: number;
  content: string;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const username = params.username as string;

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return;
        }
        const d = await r.json();
        setProfile(d.user || null);
        setRecentPosts(d.recentPosts || []);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-48 bg-[#13131f] rounded-2xl mb-4" />
          <div className="h-32 bg-[#13131f] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-white mb-2">Пользователь не найден</h2>
        <Link href="/forum" className="text-orange-400 hover:underline">
          Вернуться на форум
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.username === profile.username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-400 transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-gray-300">Профиль</span>
        <span>/</span>
        <span className="text-gray-300">{profile.username}</span>
      </div>

      {/* Banner + Avatar */}
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden mb-6">
        {/* Banner */}
        <div
          className="h-48 bg-gradient-to-r from-orange-500/20 to-red-600/20 relative"
          style={
            profile.banner
              ? {
                  backgroundImage: `url(${profile.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          {profile.isBanned && (
            <div className="absolute top-4 right-4 bg-red-500/90 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
              🚫 Аккаунт заблокирован
            </div>
          )}
          {profile.isMuted && !profile.isBanned && (
            <div className="absolute top-4 right-4 bg-yellow-500/90 text-black text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
              🔇 Аккаунт заглушен
            </div>
          )}
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#13131f] shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-4xl border-4 border-[#13131f] shadow-xl">
                {(profile.displayName || profile.username)[0].toUpperCase()}
              </div>
            )}

            {isOwner && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                ✏️ Редактировать профиль
              </Link>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-white">
                {profile.displayName || profile.username}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-lg ${getRoleBadgeColor(profile.role)}`}>
                {getRoleLabel(profile.role)}
              </span>
            </div>
            <div className="text-gray-500 text-sm mb-3">@{profile.username}</div>

            {profile.bio && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-2xl">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2 text-gray-400">
                <span>📅</span>
                <span>На форуме с {formatDateShort(profile.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>💬</span>
                <span>{profile.postCount} сообщений</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status warnings */}
      {profile.isBanned && profile.banReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 mb-6">
          <div className="text-red-400 font-bold mb-1">🚫 Причина блокировки:</div>
          <div className="text-red-300 text-sm">{profile.banReason}</div>
        </div>
      )}

      {profile.isMuted && profile.muteReason && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-6 py-4 mb-6">
          <div className="text-yellow-400 font-bold mb-1">🔇 Причина мута:</div>
          <div className="text-yellow-300 text-sm">{profile.muteReason}</div>
          {profile.mutedUntil && (
            <div className="text-yellow-400/60 text-xs mt-1">До: {formatDateShort(profile.mutedUntil)}</div>
          )}
        </div>
      )}

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e1e2e]">
            <h2 className="text-white font-bold">Последние сообщения</h2>
          </div>
          <div className="divide-y divide-[#1e1e2e]">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-6 py-4">
                <Link
                  href={`/forum/topic/${post.topicId}`}
                  className="text-orange-400 hover:underline text-sm font-medium"
                >
                  Перейти к теме →
                </Link>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                <div className="text-gray-600 text-xs mt-1">{timeAgo(post.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
