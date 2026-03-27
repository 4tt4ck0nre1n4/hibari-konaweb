/**
 * カテゴリIDから決定的にバッジ用の Tailwind クラスを返す（同じIDは常に同じ配色）。
 */
const PALETTE = [
  "bg-violet-100 text-violet-800",
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
] as const;

export function getCategoryBadgeClasses(categoryId: number): string {
  const n = Number.isFinite(categoryId) ? Math.abs(Math.trunc(categoryId)) : 0;
  const idx = n % PALETTE.length;
  return PALETTE[idx] ?? PALETTE[0];
}
