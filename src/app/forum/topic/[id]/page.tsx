"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate, getRoleBadgeColor, getRoleLabel, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface PostAuthor {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
  postCount: number;
  createdAt: string;
}

interface Post {
  id: number;
  content: string;
  createdAt: string;
  isEdited: boolean;
  editedAt: string | null;
  author: PostAuthor | null;
}

interface Topic {
  id: number;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  author: PostAuthor | null;
  subforumId: number;
}

interface Subforum {
  id: number;
  name: string;
}

export default function TopicPage() {
  const params = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subforum, setSubforum] = useState<Subforum | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const id = params.id as string;

  const load = async () => {
    const res = await fetch(`/api/forum/topics/${id}`);
    const data = await res.json();
    setTopic(data.topic || null);
    setSubforum(data.subforum || null);
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reply.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: parseInt(id), content: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts((prev) => [...prev, data.post]);
      setReply("");
      if (topic) {
        setTopic((t) => t ? { ...t, replyCount: t.replyCount + 1 } : t);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setPosting(false);
    }
  };

  const togglePin = async () => {
    if (!topic) return;
    await fetch(`/api/forum/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !topic.isPinned }),
    });
    setTopic((t) => t ? { ...t, isPinned: !t.isPinned } : t);
  };

  const toggleLock = async () => {
    if (!topic) return;
    await fetch(`/api/forum/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLocked: !topic.isLocked }),
    });
    setTopic((t) => t ? { ...t, isLocked: !t.isLocked } : t);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-2/3" />
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[#13131f] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Тема не найдена</h2>
        <Link href="/forum" className="text-orange-400 hover:underline">
          Вернуться на форум
        </Link>
      </div>
    );
  }

  const isAdmin = user && (user.role === "admin" || user.role === "moderator");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-orange-400 transition-colors">Главная</Link>
        <span>/</span>
        <Link href="/forum" className="hover:text-orange-400 transition-colors">Форум</Link>
        {subforum && (
          <>
            <span>/</span>
            <Link
              href={`/forum/subforum/${subforum.id}`}
              className="hover:text-orange-400 transition-colors"
            >
              {subforum.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-300 truncate max-w-xs">{topic.title}</span>
      </div>

      {/* Topic header */}
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-6 py-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {topic.isPinned && <span className="text-orange-400 mt-1">📌</span>}
            {topic.isLocked && <span className="text-gray-500 mt-1">🔒</span>}
            <div>
              <h1 className="text-2xl font-black text-white">{topic.title}</h1>
              <div className="text-gray-500 text-sm mt-1 flex items-center gap-3">
                <span>👁 {topic.viewCount} просмотров</span>
                <span>💬 {topic.replyCount} ответов</span>
                <span>📅 {formatDate(topic.createdAt)}</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={togglePin}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  topic.isPinned
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {topic.isPinned ? "📌 Открепить" : "📌 Закрепить"}
              </button>
              <button
                onClick={toggleLock}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  topic.isLocked
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {topic.isLocked ? "🔓 Открыть" : "🔒 Закрыть"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`bg-[#13131f] border rounded-2xl overflow-hidden flex flex-col md:flex-row ${
              index === 0
                ? "border-orange-500/20"
                : "border-[#1e1e2e]"
            }`}
          >
            {/* Author sidebar */}
            <div className="md:w-52 flex-shrink-0 p-5 bg-[#0d0d14] border-b md:border-b-0 md:border-r border-[#1e1e2e] flex md:flex-col items-center md:items-start gap-4">
              {post.author ? (
                <>
                  <Link href={`/profile/${post.author.username}`}>
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/30 hover:border-orange-500/60 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-2xl border-2 border-orange-500/30">
                        {(post.author.displayName || post.author.username)[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="text-white font-bold hover:text-orange-400 transition-colors block text-sm"
                    >
                      {post.author.displayName || post.author.username}
                    </Link>
                    <div className="text-gray-500 text-xs mb-2">@{post.author.username}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${getRoleBadgeColor(post.author.role)}`}>
                      {getRoleLabel(post.author.role)}
                    </span>
                    <div className="mt-2 text-gray-600 text-xs">
                      Сообщений: {post.author.postCount}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Удалённый пользователь</div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="prose-dark mb-4">{post.content}</div>
              <div className="text-gray-600 text-xs flex items-center gap-3">
                <span>📅 {formatDate(post.createdAt)}</span>
                {post.isEdited && post.editedAt && (
                  <span className="text-gray-700">✏️ Изменено {timeAgo(post.editedAt)}</span>
                )}
                {index === 0 && (
                  <span className="text-orange-400/60 text-xs border border-orange-500/20 px-2 py-0.5 rounded">
                    #OP
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {user ? (
        topic.isLocked && user.role === "user" ? (
          <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-6 py-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-400">Тема закрыта для ответов</p>
          </div>
        ) : user.isBanned ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-6 text-center text-red-400">
            Ваш аккаунт заблокирован
          </div>
        ) : user.isMuted ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-6 py-6 text-center text-yellow-400">
            Вы не можете отвечать (мут)
          </div>
        ) : (
          <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>✏️</span> Ваш ответ
            </h3>
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Напишите ваш ответ..."
                rows={5}
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                required
              />
              <button
                type="submit"
                disabled={posting}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {posting ? "Отправляем..." : "Ответить"}
              </button>
            </form>
          </div>
        )
      ) : (
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl px-6 py-8 text-center">
          <p className="text-gray-400 mb-4">Войдите, чтобы ответить в этой теме</p>
          <Link
            href="/forum"
            className="text-orange-400 hover:underline"
          >
            ← Вернуться к форуму
          </Link>
        </div>
      )}
    </div>
  );
}
