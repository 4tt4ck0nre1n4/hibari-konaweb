/**
 * Google Analytics (GA4) ヘルパー関数
 *
 * カスタムイベントの送信やページビューの追跡を簡単に行うためのユーティリティ
 */

// グローバルな gtag 関数の型定義
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'consent',
      targetOrAction: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * カスタムイベントを Google Analytics に送信
 *
 * @example
 * // ボタンクリックの追跡
 * trackEvent('button_click', {
 *   button_name: 'contact_form_submit',
 *   page_location: window.location.href
 * });
 *
 * @example
 * // ダウンロードの追跡
 * trackEvent('file_download', {
 *   file_name: 'catalog.pdf',
 *   file_extension: 'pdf'
 * });
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else if (import.meta.env.DEV) {
    console.log('[GA Mock Event]', eventName, eventParams);
  }
}

/**
 * ページビューを手動で送信（SPAのクライアント側ルーティング用）
 *
 * @example
 * // ルート変更時にページビューを送信
 * trackPageView('/about');
 */
export function trackPageView(
  pagePath: string,
  pageTitle?: string
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  } else if (import.meta.env.DEV) {
    console.log('[GA Mock PageView]', pagePath, pageTitle);
  }
}

/**
 * カスタムディメンションを設定
 *
 * @example
 * // ユーザー属性の設定
 * setUserProperties({
 *   user_type: 'premium',
 *   language: 'ja'
 * });
 */
export function setUserProperties(
  properties: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  } else if (import.meta.env.DEV) {
    console.log('[GA Mock UserProperties]', properties);
  }
}

/**
 * フォーム送信イベントの追跡
 *
 * @example
 * trackFormSubmit('contact_form', true);
 */
export function trackFormSubmit(
  formName: string,
  success: boolean
): void {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  });
}

/**
 * リンククリックの追跡
 *
 * @example
 * trackLinkClick('https://example.com', 'external_link');
 */
export function trackLinkClick(
  url: string,
  linkType: 'external_link' | 'internal_link' | 'download' = 'external_link'
): void {
  trackEvent('link_click', {
    link_url: url,
    link_type: linkType,
  });
}

/**
 * スクロール深度の追跡
 *
 * @example
 * trackScrollDepth(75); // 75%までスクロール
 */
export function trackScrollDepth(percentage: number): void {
  trackEvent('scroll', {
    percent_scrolled: percentage,
  });
}

/**
 * 動画再生イベントの追跡
 *
 * @example
 * trackVideoPlay('intro_video', 120);
 */
export function trackVideoPlay(
  videoName: string,
  videoDuration?: number
): void {
  trackEvent('video_play', {
    video_name: videoName,
    video_duration: videoDuration,
  });
}

/**
 * 検索イベントの追跡
 *
 * @example
 * trackSearch('astro tutorial', 42);
 */
export function trackSearch(
  searchTerm: string,
  resultCount?: number
): void {
  trackEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
  });
}

/**
 * エラーイベントの追跡
 *
 * @example
 * trackError('api_error', 'Failed to fetch posts');
 */
export function trackError(
  errorType: string,
  errorMessage?: string
): void {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
  });
}

/**
 * タイミングイベントの追跡（パフォーマンス計測）
 *
 * @example
 * trackTiming('page_load', 'content_loaded', 1234);
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number
): void {
  trackEvent('timing_complete', {
    name: variable,
    value: value,
    event_category: category,
  });
}

