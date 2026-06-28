"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { formatDateShort, getRoleBadgeColor, getRoleLabel } from "@/lib/utils";

interface AdminUser {
  id: number;
  username: string;
  displayName: string | null;
  email: string;
  role: string;
  avatar: string | null;
  isMuted: boolean;
  isBanned: boolean;
  mutedUntil: string | null;
  muteReason: string | null;
  banReason: string | null;
  postCount: number;
  createdAt: string;
}

interface ActionModal {
  user: AdminUser;
  action: "mute" | "unmute" | "ban" | "unban" | "setRole";
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ActionModal | null>(null);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "moderator")) {
      loadUsers();
    }
  }, [user, loadUsers]);

  const handleAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    setActionError("");

    try {
      const body: Record<string, unknown> = { action: modal.action };
      if (modal.action === "mute") {
        body.reason = reason;
        if (duration) body.duration = parseInt(duration);
      } else if (modal.action === "ban") {
        body.reason = reason;
      } else if (modal.action === "setRole") {
        body.role = selectedRole;
      }

      const res = await fetch(`/api/admin/users/${modal.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionSuccess("Действие выполнено успешно!");
      await loadUsers();
      setTimeout(() => {
        setModal(null);
        setActionSuccess("");
        setReason("");
        setDuration("");
      }, 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещён</h2>
        <p className="text-gray-400 mb-4">У вас нет прав для просмотра этой страницы</p>
        <Link href="/forum" className="text-orange-400 hover:underline">
          Вернуться на форум
        </Link>
      </div>
    );
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      mute: "🔇 Замутить",
      unmute: "🔊 Размутить",
      ban: "🚫 Заблокировать",
      unban: "✅ Разблокировать",
      setRole: "🎖️ Изменить роль",
    };
    return labels[action] || action;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-2xl">
          ⚙️
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Панель управления</h1>
          <p className="text-gray-400 text-sm">RusCity Life RP — Администрирование форума</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Link href="/forum" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl text-sm transition-colors">
          ← Форум
        </Link>
        <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl text-sm font-medium">
          👥 Управление пользователями
        </div>
      </div>

      {/* Users management */}
      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1e1e2e] flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-white font-bold text-xl">Пользователи</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsers()}
              placeholder="Поиск по логину или email..."
              className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors w-64"
            />
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm transition-colors"
            >
              Найти
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e2e] text-left text-xs uppercase text-gray-500 tracking-wide">
                  <th className="px-6 py-3">Пользователь</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Сообщений</th>
                  <th className="px-4 py-3">Регистрация</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.username}
                            className="w-9 h-9 rounded-full object-cover border border-[#2a2a3e]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/60 to-red-600/60 flex items-center justify-center text-white font-bold text-sm">
                            {(u.displayName || u.username)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium text-sm">
                            {u.displayName || u.username}
                          </div>
                          <div className="text-gray-500 text-xs">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${getRoleBadgeColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {u.isBanned ? (
                          <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                            🚫 Бан
                          </span>
                        ) : (
                          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                            ✅ Активен
                          </span>
                        )}
                        {u.isMuted && (
                          <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                            🔇 Мут
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">{u.postCount}</td>
                    <td className="px-4 py-4 text-gray-500 text-xs">{formatDateShort(u.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <Link
                          href={`/profile/${u.username}`}
                          className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
                        >
                          Профиль
                        </Link>

                        {/* Mute/Unmute */}
                        {!u.isMuted ? (
                          <button
                            onClick={() => { setModal({ user: u, action: "mute" }); setReason(""); setDuration(""); setActionError(""); setActionSuccess(""); }}
                            className="px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                          >
                            🔇 Мут
                          </button>
                        ) : (
                          <button
                            onClick={() => { setModal({ user: u, action: "unmute" }); setActionError(""); setActionSuccess(""); }}
                            className="px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                          >
                            🔊 Размут
                          </button>
                        )}

                        {/* Ban/Unban */}
                        {!u.isBanned ? (
                          <button
                            onClick={() => { setModal({ user: u, action: "ban" }); setReason(""); setActionError(""); setActionSuccess(""); }}
                            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            🚫 Бан
                          </button>
                        ) : (
                          <button
                            onClick={() => { setModal({ user: u, action: "unban" }); setActionError(""); setActionSuccess(""); }}
                            className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          >
                            ✅ Разбан
                          </button>
                        )}

                        {/* Change role (admin only) */}
                        {user.role === "admin" && u.id !== user.id && (
                          <button
                            onClick={() => { setModal({ user: u, action: "setRole" }); setSelectedRole(u.role); setActionError(""); setActionSuccess(""); }}
                            className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                          >
                            🎖️ Роль
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="px-6 py-12 text-center text-gray-500">
                Пользователи не найдены
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !actionLoading && setModal(null)}
          />
          <div className="relative w-full max-w-md bg-[#13131f] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-[#2a2a3e] bg-gradient-to-r from-orange-500/10 to-transparent">
              <h3 className="text-white font-bold text-lg">
                {getActionLabel(modal.action)}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Пользователь:{" "}
                <span className="text-white font-medium">
                  {modal.user.displayName || modal.user.username}
                </span>
                {" "}(@{modal.user.username})
              </p>
            </div>

            <div className="px-6 py-5">
              {actionSuccess ? (
                <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center">
                  ✅ {actionSuccess}
                </div>
              ) : (
                <>
                  {actionError && (
                    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      {actionError}
                    </div>
                  )}

                  {(modal.action === "mute" || modal.action === "ban") && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                          Причина *
                        </label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Укажите причину..."
                          className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      {modal.action === "mute" && (
                        <div>
                          <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                            Длительность (минуты, 0 = навсегда)
                          </label>
                          <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="0 = навсегда"
                            min="0"
                            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {modal.action === "setRole" && (
                    <div className="mb-6">
                      <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                        Выберите роль
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="user">Игрок</option>
                        <option value="helper">Хелпер</option>
                        <option value="vip">VIP</option>
                        <option value="moderator">Модератор</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </div>
                  )}

                  {(modal.action === "unmute" || modal.action === "unban") && (
                    <p className="text-gray-400 text-sm mb-6">
                      Вы уверены, что хотите {modal.action === "unmute" ? "размутить" : "разблокировать"} пользователя{" "}
                      <span className="text-white font-medium">@{modal.user.username}</span>?
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleAction}
                      disabled={actionLoading || ((modal.action === "mute" || modal.action === "ban") && !reason)}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {actionLoading ? "Применяем..." : "Подтвердить"}
                    </button>
                    <button
                      onClick={() => setModal(null)}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
