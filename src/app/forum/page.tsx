"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { timeAgo, getRoleBadgeColor, getRoleLabel } from "@/lib/utils";

interface Subforum {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  topicCount: number;
  postCount: number;
  lastPostAt: string | null;
  lastPostUsername: string | null;
  isLocked: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  subforums: Subforum[];
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-16 bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-400 transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-gray-300">Форум</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-8">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          Форум
        </span>{" "}
        RusCity Life RP
      </h1>

      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden"
          >
            {/* Category header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-[#1e1e2e]">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-gray-500 text-sm mt-1">{cat.description}</p>
              )}
            </div>

            {/* Subforums */}
            <div className="divide-y divide-[#1e1e2e]">
              {cat.subforums.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Подразделы не найдены
                </div>
              ) : (
                cat.subforums.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/forum/subforum/${sub.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-orange-500/40 transition-colors">
                      {sub.icon || "💬"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                          {sub.name}
                        </h3>
                        {sub.isLocked && (
                          <span className="text-xs text-gray-500">🔒 Закрыт</span>
                        )}
                      </div>
                      {sub.description && (
                        <p className="text-gray-500 text-sm truncate">{sub.description}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8 text-sm flex-shrink-0">
                      <div className="text-center">
                        <div className="text-white font-bold">{sub.topicCount}</div>
                        <div className="text-gray-500 text-xs">тем</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{sub.postCount}</div>
                        <div className="text-gray-500 text-xs">сообщений</div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        {sub.lastPostAt ? (
                          <>
                            <div className="text-gray-400 text-xs">{timeAgo(sub.lastPostAt)}</div>
                            {sub.lastPostUsername && (
                              <div className="text-orange-400 text-xs truncate">{sub.lastPostUsername}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-600 text-xs">Нет сообщений</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
