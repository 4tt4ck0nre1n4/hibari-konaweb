/**
 * 見積書番号を生成
 * 形式: EST-YYYYMMDD-XXXX
 */
export function generateEstimateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `EST-${year}${month}${day}-${random}`;
}

/**
 * 日付を表示用フォーマットに変換
 * 形式: YYYY年MM月DD日
 */
export function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * 有効期限日を計算
 */
export function calculateExpiryDate(issueDate: Date, validityDays: number): Date {
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + validityDays);
  return expiryDate;
}
