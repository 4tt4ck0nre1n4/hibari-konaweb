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
  company?: string;
  message: string;
  wpcf7_unit_tag: string;
};

// Contact Form 7 API レスポンスの型定義
type WPCF7InvalidField = {
  message: string;
  idref: string | null;
  error_id: string;
  // Contact Form 7 REST API が返す追加情報（環境やバージョンで有無がある）
  field?: string;
  into?: string;
};

type WPCF7Response = {
  status: "mail_sent" | "validation_failed" | "mail_failed" | "aborted" | "spam";
  message: string;
  invalid_fields?: WPCF7InvalidField[];
  posted_data_hash?: string;
};

export default function ContactForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [hoveredField, setHoveredField] = useState<"name" | "company" | "email" | "message" | null>(null);

  const [hoveredSubmit, setHoveredSubmit] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // レート制限用の送信履歴
  const submissionHistoryRef = useRef<number[]>([]);

  // PDF添付用の状態
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [estimateNumber, setEstimateNumber] = useState<string | null>(null);

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

  // SessionStorageからPDFデータを取得
  useEffect(() => {
    try {
      const pdfData = sessionStorage.getItem('estimatePDF');
      const estNumber = sessionStorage.getItem('estimateNumber');

      if (pdfData !== null && pdfData.trim() !== '' && estNumber !== null && estNumber.trim() !== '') {
        devLog('✅ [Contact Form] PDF data found in SessionStorage');

        // Base64からBlobに変換
        const base64Response = fetch(pdfData);
        base64Response.then(res => res.blob()).then(blob => {
          const file = new File([blob], `estimate_${estNumber}.pdf`, { type: 'application/pdf' });
          setPdfFile(file);
          setEstimateNumber(estNumber);
          devLog(`✅ [Contact Form] PDF file created: ${file.name}, size: ${file.size} bytes`);
        }).catch(err => {
          devError('❌ [Contact Form] Failed to convert PDF data:', err);
        });

        // 使用後はSessionStorageをクリア
        sessionStorage.removeItem('estimatePDF');
        sessionStorage.removeItem('estimateNumber');
      } else {
        devLog('ℹ️ [Contact Form] No PDF data in SessionStorage');
      }
    } catch (error) {
      devError('❌ [Contact Form] Error loading PDF from SessionStorage:', error);
    }
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
    devLog("🔍 [Contact Form] Starting reCAPTCHA token retrieval...");

    if (RECAPTCHA_SITE_KEY === undefined || RECAPTCHA_SITE_KEY === null || RECAPTCHA_SITE_KEY.trim() === "") {
      devWarn("⚠️ [Contact Form] reCAPTCHA site key is not set. Skipping reCAPTCHA verification.");
      devWarn("⚠️ [Contact Form] Check if PUBLIC_RECAPTCHA_SITE_KEY is set in environment variables.");
      return null;
    }

    devLog("✅ [Contact Form] reCAPTCHA site key found:", `${RECAPTCHA_SITE_KEY.substring(0, 10)}...`);

    const grecaptcha = window.grecaptcha;
    if (grecaptcha === undefined || grecaptcha === null) {
      devWarn("⚠️ [Contact Form] reCAPTCHA is not loaded. Skipping reCAPTCHA verification.");
      devWarn("⚠️ [Contact Form] Check if reCAPTCHA script is loaded correctly.");
      return null;
    }

    devLog("✅ [Contact Form] reCAPTCHA object found, executing...");

    try {
      return new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
          devLog("✅ [Contact Form] reCAPTCHA ready, executing with site key...");
          grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action: "contact" })
            .then((token) => {
              devLog("✅ [Contact Form] reCAPTCHA token generated successfully");
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
    // 会社名は必須項目ではないため、空文字列でも送信する
    formData.append("your-company", data.company !== undefined && data.company !== null ? data.company : "");
    formData.append("your-message", data.message);
    formData.append("_wpcf7_unit_tag", data.wpcf7_unit_tag);

    // PDFファイルがある場合は添付
    if (pdfFile) {
      formData.append("estimate-pdf", pdfFile, pdfFile.name);
      devLog(`✅ [Contact Form] PDF file attached: ${pdfFile.name}`);
    }

    // 見積番号がある場合は追加
    if (estimateNumber !== null && estimateNumber.trim() !== '') {
      formData.append("estimate-number", estimateNumber);
      devLog(`✅ [Contact Form] Estimate number added: ${estimateNumber}`);
    }

    try {
      // reCAPTCHAトークンの取得と追加
      // 注意: 一時的にreCAPTCHAを無効化してテストする場合は、以下のブロックをコメントアウトしてください
      devLog("🔄 [Contact Form] Attempting to get reCAPTCHA token...");
      const recaptchaToken = await getRecaptchaToken();

      if (recaptchaToken !== null && recaptchaToken !== undefined && recaptchaToken.trim() !== "") {
        // Contact Form 7のREST APIは_wpcf7_recaptcha_responseフィールド名を期待する
        formData.append("_wpcf7_recaptcha_response", recaptchaToken);
        // 互換性のため、g-recaptcha-responseも追加
        formData.append("g-recaptcha-response", recaptchaToken);
        devLog(
          "✅ [Contact Form] reCAPTCHA token obtained and added to form data:",
          `${recaptchaToken.substring(0, 20)}...`
        );
      } else {
        devWarn("⚠️ [Contact Form] reCAPTCHA token not available, but continuing with submission");
        devWarn("⚠️ [Contact Form] This may cause the submission to be marked as spam");
        devWarn("⚠️ [Contact Form] FormData will be sent without _wpcf7_recaptcha_response field");
      }

      // デバッグ用: reCAPTCHAトークンの値をログ出力（最初の50文字のみ）
      if (recaptchaToken !== null && recaptchaToken !== undefined && recaptchaToken.trim() !== "") {
        devLog("🔍 [Contact Form] reCAPTCHA token (first 50 chars):", recaptchaToken.substring(0, 50));
      }

      // FormDataの内容を確認（デバッグ用）
      devLog("📋 [Contact Form] FormData keys:", Array.from(formData.keys()));

      // デバッグ用: 送信先のエンドポイントをログ出力（常に表示）
      devLog("📤 [Contact Form] Sending POST request to:", CONTACT_WPCF7_API);
      devLog("📤 [Contact Form] API URL source:", import.meta.env.PUBLIC_API_URL);

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

      let responseText = await response.text();
      let responseData: WPCF7Response;

      // レスポンスの生データを常にログ出力（デバッグ用）
      devLog("📥 [Contact Form] Raw server response:", responseText);
      devLog("📥 [Contact Form] Response status:", response.status, response.statusText);

      // レスポンスの先頭から余分な文字列（functions.php等）を削除
      // JSONの開始位置（{）を探す
      const jsonStartIndex = responseText.indexOf("{");
      if (jsonStartIndex > 0) {
        devWarn(
          "⚠️ [Contact Form] Response contains extra text before JSON, removing:",
          responseText.substring(0, jsonStartIndex)
        );
        responseText = responseText.substring(jsonStartIndex);
      }

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
          devError("❌ [Contact Form] Invalid response format:", parsed);
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        devError("❌ [Contact Form] Failed to parse response:", {
          error: parseError,
          responseText: responseText,
          status: response.status,
        });
        throw new Error(`サーバーからの応答が正しくありません。ステータス: ${response.status}`);
      }

      // レスポンスをコンソールに出力（デバッグ用）
      devLog("📋 [Contact Form] Parsed response data:", responseData);

      // Contact Form 7のレスポンスステータスを確認
      if (responseData.status === "mail_sent") {
        // メール送信成功時のみリダイレクト
        devLog("Mail sent successfully. Redirecting to thanks page...");
        
        // お問い合わせ番号を生成 (メールと同じ形式)
        const now = new Date();
        const inquiryNumber = `INQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const inquiryDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // SessionStorageに保存
        sessionStorage.setItem('inquiryNumber', inquiryNumber);
        sessionStorage.setItem('inquiryDate', inquiryDate);
        devLog("✅ [Contact Form] Inquiry number generated:", inquiryNumber);
        
        window.location.replace(THANKS_URL);
      } else if (responseData.status === "validation_failed") {
        // バリデーションエラー
        const errorMessages = responseData.invalid_fields
          ? responseData.invalid_fields
              .map((field) => {
                const fieldName =
                  field.field !== undefined && field.field !== null && String(field.field).trim() !== ""
                    ? String(field.field).trim()
                    : null;
                return fieldName !== null ? `${fieldName}: ${field.message}` : field.message;
              })
              .join("\n")
          : responseData.message !== undefined && responseData.message !== null && responseData.message.trim() !== ""
            ? responseData.message.trim()
            : "入力内容に誤りがあります。";
        alert(errorMessages);
      } else if (responseData.status === "mail_failed") {
        // メール送信失敗
        devError("❌ [Contact Form] Mail sending failed:", responseData);
        const errorMessage =
          responseData.message !== undefined && responseData.message.trim() !== ""
            ? responseData.message
            : "メール送信に失敗しました。";
        alert(
          `${errorMessage}\n` +
            "WordPressのメール送信機能が正常に動作していない可能性があります。\n" +
            "SMTPプラグインの設定を確認してください。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      } else if (responseData.status === "spam") {
        // スパムとして判定された場合
        devError("❌ [Contact Form] Submission marked as spam:", responseData);
        devError("❌ [Contact Form] Full response:", JSON.stringify(responseData, null, 2));

        // FormDataにreCAPTCHAトークンが含まれているか確認
        const hasRecaptchaToken = formData.has("_wpcf7_recaptcha_response") || formData.has("g-recaptcha-response");
        devLog(
          "🔍 [Contact Form] _wpcf7_recaptcha_response in FormData:",
          formData.has("_wpcf7_recaptcha_response")
        );
        devLog("🔍 [Contact Form] g-recaptcha-response in FormData:", formData.has("g-recaptcha-response"));

        const spamMessage =
          responseData.message !== undefined && responseData.message.trim() !== ""
            ? responseData.message
            : "メッセージがスパムとして判定されました。";

        let alertMessage = `${spamMessage}\n\n`;
        alertMessage += "考えられる原因:\n";

        if (!hasRecaptchaToken) {
          alertMessage += "⚠️ reCAPTCHAトークンがFormDataに含まれていません\n";
        } else {
          alertMessage += "✅ reCAPTCHAトークンは送信されています\n";
        }

        alertMessage += "1. WordPress側のreCAPTCHA設定（シークレットキー）を確認してください\n";
        alertMessage += "2. Google reCAPTCHA管理画面で、ドメインが正しく登録されているか確認してください\n";
        alertMessage += "3. ブラウザの開発者ツール（F12）のコンソールで詳細を確認してください\n\n";
        alertMessage += "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。";

        alert(alertMessage);
      } else {
        // その他のエラー（aborted など）
        devError("❌ [Contact Form] Unexpected response status:", responseData);
        const statusMessage =
          responseData.message !== undefined && responseData.message.trim() !== ""
            ? responseData.message
            : "送信処理中にエラーが発生しました。";
        alert(
          `${statusMessage}\n` +
            `ステータス: ${responseData.status}\n` +
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
          error.message.includes("Failed to fetch") ||
          error.message.includes("ERR_INTERNET_DISCONNECTED") ||
          error.message.includes("ERR_NETWORK_CHANGED") ||
          error.message.includes("ERR_CONNECTION_REFUSED") ||
          error.message.includes("ERR_CONNECTION_RESET")
        ) {
          // ネットワークエラーの場合
          devError("❌ [Contact Form] Network error:", error);
          const isLocalDev = window.location.hostname === "localhost" || window.location.hostname.endsWith(".local");
          const apiUrl = CONTACT_WPCF7_API;

          let errorMessage: string;

          if (isLocalDev && apiUrl.includes("hibari-konaweb.com")) {
            errorMessage = `ネットワークエラーが発生しました。

⚠️ ローカル環境から本番環境のWordPress APIに接続しようとしています。
ローカル開発環境では、.envファイルにローカルのWordPress URLを設定してください。
例: PUBLIC_API_URL=http://hibari-konaweb.local

現在のAPI URL: ${apiUrl}

問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。`;
          } else {
            errorMessage = `ネットワークエラーが発生しました。
インターネット接続を確認し、しばらく時間をおいて再度お試しください。

接続先: ${apiUrl}

問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。`;
          }

          alert(errorMessage);
        } else {
          // その他のエラー
          devError("❌ [Contact Form] Error:", error);
          devError("❌ [Contact Form] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
          alert(
            `送信処理中にエラーが発生しました。\n` +
              `エラー: ${error.message}\n` +
              "ブラウザの開発者ツール（F12）のコンソールタブで詳細を確認できます。\n" +
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
          <div className={styles.form__hidden}>
            <input type="hidden" name="_wpcf7" value={wpcf7Id} />
            <input type="hidden" name="_wpcf7_locale" value="ja" />
            <input type="hidden" name="_wpcf7_unit_tag" value={wpcf7UnitTag} />
            <input type="hidden" name="_wpcf7_container_post" value={wpcf7PostId} />
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__name} htmlFor="name">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "name" ? "" : styles["label__text--active"]}`}
                >
                  お名前
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "name" ? styles["label__text--active"] : ""}`}
                >
                  Name
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
            <label className={styles.label__company} htmlFor="company">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${
                    hoveredField === "company" ? "" : styles["label__text--active"]
                  }`}
                >
                  会社名
                </span>
                <span
                  className={`${styles.label__text}${
                    hoveredField === "company" ? styles["label__text--active"] : ""
                  }`}
                >
                  Company Name
                </span>
              </span>
            </label>
            <input
              id="company"
              className={styles.input__company}
              type="text"
              {...register("company")}
              autoComplete="organization"
              placeholder="Your Company Name"
              aria-required="false"
              onMouseEnter={() => setHoveredField("company")}
              onMouseLeave={() => setHoveredField(null)}
            />
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__email} htmlFor="email">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "email" ? "" : styles["label__text--active"]}`}
                >
                  メール
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "email" ? styles["label__text--active"] : ""}`}
                >
                  Email
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
                  お問い合わせ
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "message" ? styles["label__text--active"] : ""}`}
                >
                  Message
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

          {pdfFile !== null && estimateNumber !== null && estimateNumber.trim() !== '' && (
            <div className={`${styles.form__box} ${styles.pdf__attachment}`}>
              <p className={styles.pdf__attachment__text}>
                <span className={styles.pdf__attachment__emoji}>📋</span> 見積書PDF添付: <strong>{pdfFile.name}</strong> ({Math.round(pdfFile.size / 1024)}KB)
                <br />
                <span className={styles.pdf__attachment__emoji}>🏷️</span> 見積番号: <strong>{estimateNumber}</strong>
              </p>
            </div>
          )}

          {rateLimitError !== null && rateLimitError !== undefined && rateLimitError.trim() !== "" && (
            <p role="alert" className={styles.error__message}>
              {rateLimitError}
            </p>
          )}

          <input
            className={styles.submit}
            type="submit"
            value={isSubmitting ? (hoveredSubmit ? "Submitting..." : "送信中...") : hoveredSubmit ? "Submit" : "送信"}
            aria-label={isSubmitting ? (hoveredSubmit ? "Submitting" : "送信中") : hoveredSubmit ? "Submit" : "送信"}
            disabled={isSubmitting}
            onMouseEnter={() => setHoveredSubmit(true)}
            onMouseLeave={() => setHoveredSubmit(false)}
          />
        </form>
      </div>
    </div>
  );
}
