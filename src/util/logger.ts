/**
 * 開発環境でのみコンソールログを出力するユーティリティ
 * 本番環境では何も出力されません
 */

const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;

/**
 * 開発環境でのみ console.log を実行
 */
export const devLog = (...args: unknown[]): void => {
  if (isDev) {
    console.log(...args);
  }
};

/**
 * 開発環境でのみ console.warn を実行
 */
export const devWarn = (...args: unknown[]): void => {
  if (isDev) {
    console.warn(...args);
  }
};

/**
 * 開発環境でのみ console.info を実行
 */
export const devInfo = (...args: unknown[]): void => {
  if (isDev) {
    console.info(...args);
  }
};

/**
 * 開発環境でのみ console.debug を実行
 */
export const devDebug = (...args: unknown[]): void => {
  if (isDev) {
    console.debug(...args);
  }
};

/**
 * エラーログは常に出力（本番環境でも必要）
 * ただし、開発環境ではより詳細な情報を出力
 */
export const devError = (...args: unknown[]): void => {
  if (isDev) {
    console.error(...args);
  } else {
    // 本番環境では最小限のエラーログのみ
    // 必要に応じてエラートラッキングサービスに送信
    console.error(...args);
  }
};



