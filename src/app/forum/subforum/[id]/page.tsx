"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Author {
  username: string;
  displayName: string | null;
  avatar: string | null;
}

interface Topic {
  id: number;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  lastPostAt: string | null;
  author: Author | null;
  lastPostUser: Author | null;
}

interface Subforum {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  isLocked: boolean;
  categoryId: number;
}

export default function SubforumPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subforum, setSubforum] = useState<Subforum | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const id = params.id as string;

  const load = () => {
    fetch(`/api/forum/subforums/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSubforum(d.subforum || null);
        setTopics(d.topics || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subforumId: parseInt(id),
          title: newTitle,
          content: newContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/forum/topic/${data.topicId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка создания темы");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#13131f] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!subforum) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Подраздел не найден</h2>
        <Link href="/forum" className="text-orange-400 hover:underline">
          Вернуться на форум
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-400 transition-colors">Главная</Link>
        <span>/</span>
        <Link href="/forum" className="hover:text-orange-400 transition-colors">Форум</Link>
        <span>/</span>
        <span className="text-gray-300">{subforum.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>{subforum.icon || "💬"}</span>
            {subforum.name}
            {subforum.isLocked && <span className="text-gray-500 text-lg">🔒</span>}
          </h1>
          {subforum.description && (
            <p className="text-gray-400 mt-2">{subforum.description}</p>
          )}
        </div>
        {user && !user.isBanned && !user.isMuted && (
          <button
            onClick={() => setShowNewTopic(!showNewTopic)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>✏️</span> Новая тема
          </button>
        )}
      </div>

      {/* New topic form */}
      {showNewTopic && user && (
        <div className="bg-[#13131f] border border-orange-500/30 rounded-2xl p-6 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">Создать новую тему</h3>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название темы..."
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                required
                minLength={3}
              />
            </div>
            <div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Текст сообщения..."
                rows={6}
                className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                required
                minLength={10}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? "Создаём..." : "Создать тему"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewTopic(false)}
                className="px-6 py-2.5 bg-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics list */}
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_80px_180px] gap-4 px-6 py-3 bg-[#0d0d14] text-gray-500 text-xs uppercase tracking-wide font-medium border-b border-[#1e1e2e]">
          <div>Тема</div>
          <div className="text-center hidden md:block">Ответы</div>
          <div className="text-center hidden md:block">Просмотры</div>
          <div className="text-right hidden md:block">Последнее сообщение</div>
        </div>

        {topics.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">Тем пока нет</h3>
            <p className="text-gray-500">
              {user ? "Создайте первую тему в этом разделе!" : "Войдите, чтобы создать тему"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e2e]">
            {topics.map((topic) => (
              <div key={topic.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_80px_180px] gap-4 px-6 py-4 hover:bg-white/3 transition-colors items-center">
                <div className="flex items-start gap-3">
                  {/* Status icons */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    {topic.isPinned && <span title="Закреплена" className="text-orange-400">📌</span>}
                    {topic.isLocked && <span title="Закрыта" className="text-gray-500">🔒</span>}
                    {!topic.isPinned && !topic.isLocked && (
                      <span className="text-blue-400">💬</span>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/forum/topic/${topic.id}`}
                      className="text-white hover:text-orange-400 transition-colors font-medium leading-snug block"
                    >
                      {topic.title}
                    </Link>
                    <div className="text-gray-500 text-sm mt-0.5">
                      {topic.author && (
                        <Link
                          href={`/profile/${topic.author.username}`}
                          className="hover:text-orange-400 transition-colors"
                        >
                          {topic.author.displayName || topic.author.username}
                        </Link>
                      )}
                      {" · "}
                      {timeAgo(topic.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block text-center text-white font-medium">
                  {topic.replyCount}
                </div>
                <div className="hidden md:block text-center text-gray-400 text-sm">
                  {topic.viewCount}
                </div>
                <div className="hidden md:block text-right text-sm">
                  {topic.lastPostAt ? (
                    <>
                      <div className="text-gray-400">{timeAgo(topic.lastPostAt)}</div>
                      {topic.lastPostUser && (
                        <Link
                          href={`/profile/${topic.lastPostUser.username}`}
                          className="text-orange-400 hover:underline text-xs truncate block"
                        >
                          {topic.lastPostUser.displayName || topic.lastPostUser.username}
                        </Link>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
