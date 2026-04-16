/** meta 用に HTML を除去して空白を正規化する */
export function stripHtmlForMeta(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
