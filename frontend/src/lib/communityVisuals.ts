import { Briefcase, Heart, Globe, GraduationCap, Users, type LucideIcon } from 'lucide-react';

const PALETTE = [
  'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
  'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500',
];

/** Communities created via the real backend rarely have a color/icon set yet — derive a stable one from the id so the UI still looks intentional. */
export function communityColor(id: string, color?: string | null): string {
  if (color) return color;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

const ICON_MAP: Record<string, LucideIcon> = { Briefcase, Heart, Globe, GraduationCap };

export function communityIcon(iconName?: string | null): LucideIcon {
  return (iconName && ICON_MAP[iconName]) || Users;
}
