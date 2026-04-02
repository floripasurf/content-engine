export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return formatDate(date);
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function getWeekDays(refDate?: Date): Date[] {
  const d = refDate ? new Date(refDate) : new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const platformIcons: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  linkedin: "💼",
  facebook: "📘",
};

export const platformNames: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

export const platformColors: Record<string, string> = {
  instagram: "from-purple-500 to-pink-500",
  tiktok: "from-gray-900 to-gray-700",
  youtube: "from-red-600 to-red-500",
  linkedin: "from-blue-700 to-blue-500",
  facebook: "from-blue-600 to-blue-400",
};

export const statusColors: Record<string, string> = {
  draft: "bg-gray-600",
  review: "bg-yellow-600",
  approved: "bg-green-600",
  rejected: "bg-red-600",
  produced: "bg-blue-600",
  scheduled: "bg-purple-600",
  published: "bg-green-600",
  failed: "bg-red-600",
};

export const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  review: "Em Revisão",
  approved: "Aprovado",
  rejected: "Rejeitado",
  produced: "Produzido",
  scheduled: "Agendado",
  published: "Publicado",
  failed: "Falhou",
};

export const pillarColors: Record<string, string> = {
  pillar_dor: "bg-red-500/20 text-red-400 border-red-500/30",
  pillar_solucao: "bg-green-500/20 text-green-400 border-green-500/30",
  "pillar_social_proof": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const pillarEmojis: Record<string, string> = {
  pillar_dor: "😤",
  pillar_solucao: "💡",
  "pillar_social_proof": "⭐",
};
