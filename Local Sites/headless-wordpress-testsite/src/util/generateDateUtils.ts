/**
 * @param dateStr
 * @returns ISO形式 (YYYY-MM-DD)
 */

export function formatDateToISO(dateStr: string): string {
  const matched = dateStr.match(/^(０-９|\d{4})年(\d{2})月(\d{2})日$/);
  if (!matched) return "";
  const [, year, month, day] = matched;
  return `${year}-${month}-${day}`;
}
