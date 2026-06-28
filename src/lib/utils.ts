export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 30) return `${days} дн. назад`;
  return formatDate(date);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Администратор",
    moderator: "Модератор",
    helper: "Хелпер",
    vip: "VIP",
    user: "Игрок",
  };
  return labels[role] || role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: "text-red-400",
    moderator: "text-blue-400",
    helper: "text-green-400",
    vip: "text-yellow-400",
    user: "text-gray-400",
  };
  return colors[role] || "text-gray-400";
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border border-red-500/30",
    moderator: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    helper: "bg-green-500/20 text-green-400 border border-green-500/30",
    vip: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    user: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  };
  return colors[role] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
}
