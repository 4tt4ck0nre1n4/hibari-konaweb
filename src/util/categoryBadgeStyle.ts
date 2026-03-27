/**
 * カテゴリIDから決定的にバッジ用のクラス名を返す（同じIDは常に同じ配色）。
 * 配色は [blog-article.css] の `.blog-post-sidebar-category-badge--tone-*` で定義（Tailwind の動的クラス欠落を避ける）。
 */
const TONE_COUNT = 6;

export function getCategoryBadgeToneIndex(categoryId: number): number {
  const n = Number.isFinite(categoryId) ? Math.abs(Math.trunc(categoryId)) : 0;
  return n % TONE_COUNT;
}

/** サイドバー「読まれている記事」カテゴリバッジ用クラス（ベース + トーン） */
export function getCategoryBadgeClasses(categoryId: number): string {
  return `blog-post-sidebar-category-badge blog-post-sidebar-category-badge--tone-${getCategoryBadgeToneIndex(categoryId)}`;
}
