import { useState, useEffect, useRef } from "react";
import PrivacyConsent from "./PrivacyConsent.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema } from "../scripts/validationSchema.ts";
import styles from "../styles/contactForm.module.css";
import { CONTACT_WPCF7_API, wpcf7Id, wpcf7UnitTag, wpcf7PostId } from "../api/headlessCms.ts";

const requiredMark = "【必須】";
const THANKS_URL = "/contact/thanks";

// reCAPTCHA設定
const RECAPTCHA_SITE_KEY = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined;
const RECAPTCHA_SCRIPT_URL = "https://www.google.com/recaptcha/api.js?render=";

// 開発環境判定
const isDev =
  typeof window !== "undefined" &&
  ((window as Window & { __DEV__?: boolean }).__DEV__ === true ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local"));

// 開発環境でのみコンソール出力
const devLog = (...args: unknown[]): void => {
  if (isDev) {
    console.log(...args);
  }
};

const devWarn = (...args: unknown[]): void => {
  if (isDev) {
    console.warn(...args);
  }
};

const devError = (...args: unknown[]): void => {
  if (isDev) {
    console.error(...args);
  }
};

// レート制限設定（1分間に最大3回まで送信可能）
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分

// reCAPTCHAの型定義
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  // AbortSignal.timeout が使える環境ではそれを優先（実装が最適化されていることが多い）
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

type FormValues = {
  name: string;
  email: string;
  message: string;
  wpcf7_unit_tag: string;
};

// Contact Form 7 API レスポンスの型定義
type WPCF7InvalidField = {
  message: string;
  idref: string | null;
  error_id: string;
};

type WPCF7Response = {
  status: "mail_sent" | "validation_failed" | "mail_failed" | "aborted" | "spam";
  message: string;
  invalid_fields?: WPCF7InvalidField[];
  posted_data_hash?: string;
};

export default function ContactForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [hoveredField, setHoveredField] = useState<"name" | "email" | "message" | null>(null);

  const [hoveredSubmit, setHoveredSubmit] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // レート制限用の送信履歴
  const submissionHistoryRef = useRef<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(validationSchema),
  });

  // reCAPTCHAスクリプトの読み込み
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY === undefined || RECAPTCHA_SITE_KEY === null || RECAPTCHA_SITE_KEY.trim() === "") {
      devWarn("⚠️ [Contact Form] reCAPTCHA site key is not set. reCAPTCHA protection is disabled.");
      return;
    }

    // 既にスクリプトが読み込まれているか確認
    if (window.grecaptcha) {
      return;
    }

    // スクリプトが既に追加されているか確認
    const existingScript = document.querySelector(`script[src^="${RECAPTCHA_SCRIPT_URL}"]`);
    if (existingScript) {
      return;
    }

    // reCAPTCHAスクリプトを動的に読み込む
    const script = document.createElement("script");
    script.src = `${RECAPTCHA_SCRIPT_URL}${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // クリーンアップ（通常は不要だが、念のため）
      const scriptToRemove = document.querySelector(`script[src^="${RECAPTCHA_SCRIPT_URL}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // レート制限チェック
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const recentSubmissions = submissionHistoryRef.current.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (recentSubmissions.length >= RATE_LIMIT_MAX_REQUESTS) {
      const firstSubmission = recentSubmissions[0];
      if (firstSubmission === undefined) {
        return false;
      }
      const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - firstSubmission)) / 1000);
      setRateLimitError(`送信回数が多すぎます。${remainingSeconds}秒後に再度お試しください。`);
      return false;
    }

    setRateLimitError(null);
    return true;
  };

  // reCAPTCHAトークンの取得
  const getRecaptchaToken = async (): Promise<string | null> => {
    if (RECAPTCHA_SITE_KEY === undefined || RECAPTCHA_SITE_KEY === null || RECAPTCHA_SITE_KEY.trim() === "") {
      devWarn("⚠️ [Contact Form] reCAPTCHA site key is not set. Skipping reCAPTCHA verification.");
      return null;
    }

    const grecaptcha = window.grecaptcha;
    if (grecaptcha === undefined || grecaptcha === null) {
      devWarn("⚠️ [Contact Form] reCAPTCHA is not loaded. Skipping reCAPTCHA verification.");
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action: "submit" })
            .then((token) => {
              resolve(token);
            })
            .catch((error) => {
              devError("❌ [Contact Form] reCAPTCHA execution failed:", error);
              reject(error instanceof Error ? error : new Error(String(error)));
            });
        });
      });
    } catch (error) {
      devError("❌ [Contact Form] Failed to get reCAPTCHA token:", error);
      return null;
    }
  };

  const onSubmit = handleSubmit(async (data: FormValues, event) => {
    if (!privacyAccepted) {
      alert("プライバシーポリシーに同意してください。");
      return;
    }

    // レート制限チェック
    if (!checkRateLimit()) {
      return;
    }

    // 送信中の重複送信を防ぐ
    if (isSubmitting) {
      return;
    }

    const target = event?.target as HTMLFormElement | null;
    if (!target) return;

    event?.preventDefault();
    setIsSubmitting(true);
    setRateLimitError(null);

    const formData = new FormData(target);
    formData.append("your-name", data.name);
    formData.append("your-email", data.email);
    formData.append("your-message", data.message);
    formData.append("_wpcf7_unit_tag", data.wpcf7_unit_tag);

    try {
      // reCAPTCHAトークンの取得と追加
      const recaptchaToken = await getRecaptchaToken();
      if (recaptchaToken !== null && recaptchaToken !== undefined && recaptchaToken.trim() !== "") {
        formData.append("g-recaptcha-response", recaptchaToken);
        devLog("✅ [Contact Form] reCAPTCHA token obtained");
      } else {
        devWarn("⚠️ [Contact Form] reCAPTCHA token not available, but continuing with submission");
      }

      // デバッグ用: 送信先のエンドポイントをログ出力（開発環境のみ）
      devLog("📤 [Contact Form] Sending POST request to:", CONTACT_WPCF7_API);

      // タイムアウト設定（30秒）- メール送信処理を考慮
      const response = await fetchWithTimeout(
        CONTACT_WPCF7_API,
        {
          method: "POST",
          body: formData,
        },
        30000
      );

      // 送信履歴に記録
      submissionHistoryRef.current.push(Date.now());

      // ステータスコードを確認
      if (!response.ok) {
        const responseText = await response.text();
        devError("❌ [Contact Form] HTTP Error Response:", {
          status: response.status,
          statusText: response.statusText,
          url: CONTACT_WPCF7_API,
          responseText: responseText,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let responseData: WPCF7Response;

      try {
        const parsed = JSON.parse(responseText) as unknown;
        // 基本的な型チェック
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "status" in parsed &&
          typeof (parsed as { status: unknown }).status === "string"
        ) {
          responseData = parsed as WPCF7Response;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        devError("Failed to parse response:", responseText);
        throw new Error("サーバーからの応答が正しくありません。");
      }

      // レスポンスをコンソールに出力（デバッグ用、開発環境のみ）
      devLog("Contact Form 7 Response:", responseData);

      // Contact Form 7のレスポンスステータスを確認
      if (responseData.status === "mail_sent") {
        // メール送信成功時のみリダイレクト
        devLog("Mail sent successfully. Redirecting to thanks page...");
        window.location.replace(THANKS_URL);
      } else if (responseData.status === "validation_failed") {
        // バリデーションエラー
        const errorMessages = responseData.invalid_fields
          ? responseData.invalid_fields.map((field) => field.message).join("\n")
          : responseData.message !== ""
            ? responseData.message
            : "入力内容に誤りがあります。";
        alert(errorMessages);
      } else if (responseData.status === "mail_failed") {
        // メール送信失敗
        devError("Mail sending failed:", responseData);
        alert(
          "メール送信に失敗しました。しばらく時間をおいて再度お試しください。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      } else {
        // その他のエラー
        devError("Unexpected response status:", responseData);
        alert(
          "送信処理中にエラーが発生しました。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      }
    } catch (error) {
      // エラーの種類に応じて適切なメッセージを表示
      if (error instanceof Error) {
        // タイムアウトエラーの場合
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          devError("❌ [Contact Form] Request timeout:", error);
          alert(
            "送信処理がタイムアウトしました。\n" +
              "サーバー側の処理に時間がかかっている可能性があります。\n" +
              "しばらく時間をおいて再度お試しください。\n" +
              "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
          );
        } else if (
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("Failed to fetch")
        ) {
          // ネットワークエラーの場合
          devError("❌ [Contact Form] Network error:", error);
          alert(
            "ネットワークエラーが発生しました。\n" +
              "インターネット接続を確認し、しばらく時間をおいて再度お試しください。\n" +
              "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
          );
        } else {
          // その他のエラー
          devError("❌ [Contact Form] Error:", error);
          alert(
            "送信処理中にエラーが発生しました。\n" +
              "しばらく時間をおいて再度お試しください。\n" +
              "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
          );
        }
      } else {
        // 予期しないエラー形式
        devError("❌ [Contact Form] Unexpected error:", error);
        alert(
          "送信処理中に予期しないエラーが発生しました。\n" +
            "しばらく時間をおいて再度お試しください。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="wpcf7">
      <div className={styles.form__inner}>
        <form
          onSubmit={(e) => void onSubmit(e)}
          aria-labelledby="contact-form-title"
          aria-describedby="contact-form-description"
        >
          <div className={styles.form_hidden}>
            <input type="hidden" name="_wpcf7" value={wpcf7Id} />
            <input type="hidden" name="_wpcf7_version" value="5.9.7" />
            <input type="hidden" name="_wpcf7_local" value="ja" />
            <input type="hidden" name="_wpcf7_unit_tag" value={wpcf7UnitTag} />
            <input type="hidden" name="_wpcf7_container_post" value={wpcf7PostId} />
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__name} htmlFor="name">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "name" ? "" : styles["label__text--active"]}`}
                >
                  Name
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "name" ? styles["label__text--active"] : ""}`}
                >
                  お名前
                </span>
              </span>
              <span className={styles.required}>{requiredMark}</span>
            </label>
            <input
              id="name"
              className={styles.input__name}
              type="text"
              {...register("name")}
              autoComplete="name"
              placeholder="Your Name"
              aria-required="true"
              onMouseEnter={() => setHoveredField("name")}
              onMouseLeave={() => setHoveredField(null)}
            />
            {Boolean(errors.name?.message) && <p role="alert">{errors.name?.message}</p>}
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__email} htmlFor="email">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "email" ? "" : styles["label__text--active"]}`}
                >
                  Email
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "email" ? styles["label__text--active"] : ""}`}
                >
                  メール
                </span>
              </span>
              <span className={styles.required}>{requiredMark}</span>
            </label>
            <input
              id="email"
              className={styles.input__email}
              type="email"
              {...register("email")}
              autoComplete="email"
              placeholder="Your Email Address"
              aria-required="true"
              onMouseEnter={() => setHoveredField("email")}
              onMouseLeave={() => setHoveredField(null)}
            />
            {Boolean(errors.email?.message) && <p role="alert">{errors.email?.message}</p>}
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__message} htmlFor="message">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "message" ? "" : styles["label__text--active"]}`}
                >
                  Message
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "message" ? styles["label__text--active"] : ""}`}
                >
                  お問い合わせ
                </span>
              </span>
              <span className={styles.required}>{requiredMark}</span>
            </label>
            <textarea
              id="message"
              className={styles.textarea__message}
              {...register("message")}
              cols={40}
              rows={6}
              autoComplete="off"
              placeholder="Type Your Message"
              aria-required="true"
              onMouseEnter={() => setHoveredField("message")}
              onMouseLeave={() => setHoveredField(null)}
            />
            {Boolean(errors.message?.message) && <p role="alert">{errors.message?.message}</p>}
          </div>
          <PrivacyConsent isChecked={privacyAccepted} onChange={setPrivacyAccepted} />

          {rateLimitError !== null && rateLimitError !== undefined && rateLimitError.trim() !== "" && (
            <p role="alert" className={styles.error__message}>
              {rateLimitError}
            </p>
          )}

          <input
            className={styles.submit}
            type="submit"
            value={isSubmitting ? (hoveredSubmit ? "送信中..." : "Submitting...") : hoveredSubmit ? "送信" : "Submit"}
            aria-label={isSubmitting ? (hoveredSubmit ? "送信中" : "Submitting") : hoveredSubmit ? "送信" : "Submit"}
            disabled={isSubmitting}
            onMouseEnter={() => setHoveredSubmit(true)}
            onMouseLeave={() => setHoveredSubmit(false)}
          />
        </form>
      </div>
    </div>
  );
}
