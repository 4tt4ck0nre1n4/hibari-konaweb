import { useState, useEffect, useRef } from "react";
import PrivacyConsent from "./PrivacyConsent.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema } from "../scripts/validationSchema.ts";
import styles from "../styles/contactForm.module.css";
import { CONTACT_WPCF7_API, wpcf7PostId, wpcf7UnitTag } from "../api/headlessCms.ts";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { wpcf7ResponseSchema, type WPCF7Response } from "../schemas/api.schema.ts";
import {
  getFromStorageSafely,
  estimatePdfDataSchema,
  clearFromStorageSafely,
  setToStorageSafely,
  inquiryDataSchema,
} from "../schemas/storage.schema.ts";

const requiredMark = "【必須】";
const THANKS_URL = "/contact/thanks";

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

const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> => {
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

  // Turnstileトークン（Site Key未設定時はウィジェット非表示・検証スキップ）
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoadError, setTurnstileLoadError] = useState(false);
  // ページ表示直後のマウントを避け、フォーム操作時または遅延後にのみTurnstileを表示（コンソールのエラー・警告の連続を防ぐ）
  const [shouldShowTurnstile, setShouldShowTurnstile] = useState(false);
  const turnstileSiteKey = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined)?.trim() ?? "";
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(validationSchema),
  });

  // SessionStorageからPDFデータを取得
  useEffect(() => {
    try {
      const pdfData = getFromStorageSafely(estimatePdfDataSchema, ["estimatePDF", "estimateNumber"], "sessionStorage");

      if (pdfData !== null) {
        devLog("✅ [Contact Form] PDF data found in SessionStorage");

        // Base64からBlobに変換
        const base64Response = fetch(pdfData.estimatePDF);
        base64Response
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `estimate_${pdfData.estimateNumber}.pdf`, { type: "application/pdf" });
            setPdfFile(file);
            setEstimateNumber(pdfData.estimateNumber);
            devLog(`✅ [Contact Form] PDF file created: ${file.name}, size: ${file.size} bytes`);
          })
          .catch((err) => {
            devError("❌ [Contact Form] Failed to convert PDF data:", err);
          });

        // 使用後はSessionStorageをクリア（安全な方法で）
        clearFromStorageSafely(["estimatePDF", "estimateNumber"], "sessionStorage");
      } else {
        devLog("ℹ️ [Contact Form] No PDF data in SessionStorage");
      }
    } catch (error) {
      devError("❌ [Contact Form] Error loading PDF from SessionStorage:", error);
    }
  }, []);

  // Turnstileを遅延マウント：フォーム操作時または表示から2.5秒後に初めて表示（ページ表示直後のリトライ連打を防ぐ）
  useEffect(() => {
    if (turnstileSiteKey === "") return;
    const timer = window.setTimeout(() => setShouldShowTurnstile(true), 2500);
    return () => window.clearTimeout(timer);
  }, [turnstileSiteKey]);

  const activateTurnstile = () => setShouldShowTurnstile(true);

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

  const onSubmit = handleSubmit(async (data: FormValues, event) => {
    if (!privacyAccepted) {
      alert("プライバシーポリシーに同意してください。");
      return;
    }

    // レート制限チェック
    if (!checkRateLimit()) {
      return;
    }

    // Turnstile検証（Site Key設定時はトークン必須）
    if (
      turnstileSiteKey !== "" &&
      (turnstileToken === null || turnstileToken === undefined || turnstileToken.trim() === "")
    ) {
      const turnstileMessage = turnstileLoadError
        ? "セキュリティ確認（Turnstile）の読み込みに失敗しています。\n\n" +
          "【管理者向け】Cloudflare Turnstile の管理画面で、このサイトのドメイン（例: hibari-konaweb.com）が「許可するドメイン」に登録されているか確認してください。登録されていないと 401 エラーになり送信できません。\n\n" +
          "ページを再読み込みして再度お試しください。"
        : "セキュリティ確認が完了していません。しばらくお待ちいただくか、ページを再読み込みしてください。";
      alert(turnstileMessage);
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

    const formData = new FormData();
    formData.append("your-name", data.name);
    formData.append("your-email", data.email);
    // 会社名は必須項目ではないため、空文字列でも送信する
    formData.append("your-company", data.company !== undefined && data.company !== null ? data.company : "");
    formData.append("your-message", data.message);
    // Contact Form 7 REST API が要求するフィールド（React で管理）
    formData.append("_wpcf7_locale", "ja");
    formData.append("_wpcf7_unit_tag", wpcf7UnitTag);
    formData.append("_wpcf7_container_post", wpcf7PostId);

    // PDFファイルがある場合は添付
    if (pdfFile) {
      formData.append("estimate-pdf", pdfFile, pdfFile.name);
      devLog(`✅ [Contact Form] PDF file attached: ${pdfFile.name}`);
    }

    // 見積番号がある場合は追加
    if (estimateNumber !== null && estimateNumber.trim() !== "") {
      formData.append("estimate-number", estimateNumber);
      devLog(`✅ [Contact Form] Estimate number added: ${estimateNumber}`);
    }

    // TurnstileトークンをFormDataに追加
    if (turnstileToken !== null && turnstileToken !== undefined && turnstileToken.trim() !== "") {
      formData.append("_wpcf7_turnstile_response", turnstileToken);
      // formData.append("cf-turnstile-response", turnstileToken);
    }

    try {
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
        // Zodスキーマで検証
        const validationResult = wpcf7ResponseSchema.safeParse(parsed);

        if (!validationResult.success) {
          devError("❌ [Contact Form] Response validation failed:", validationResult.error.format());
          throw new Error("Invalid response format");
        }

        responseData = validationResult.data;
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
        const inquiryNumber = `INQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
        const inquiryDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        // SessionStorageに保存（Zodスキーマで検証）
        const saved = setToStorageSafely(inquiryDataSchema, { inquiryNumber, inquiryDate }, "sessionStorage");

        if (saved) {
          devLog("✅ [Contact Form] Inquiry number generated:", inquiryNumber);
        } else {
          devError("❌ [Contact Form] Failed to save inquiry data to SessionStorage");
        }

        setTurnstileToken(null); // トークンは1回限り有効のためリセット
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

        const spamMessage =
          responseData.message !== undefined && responseData.message.trim() !== ""
            ? responseData.message
            : "メッセージがスパムとして判定されました。";

        let alertMessage = `${spamMessage}\n\n`;
        alertMessage += "考えられる原因:\n";
        alertMessage += "1. 短時間に複数回送信していないか確認してください\n";
        alertMessage += "2. 内容にスパムと誤認されやすい表現が含まれていないか確認してください\n";
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
      setTurnstileToken(null); // エラー時はトークンをリセット（再送信時に再取得）
      turnstileRef.current?.reset(); // ウィジェットをリセットし新トークンを取得
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
              onFocus={activateTurnstile}
              onMouseEnter={() => setHoveredField("name")}
              onMouseLeave={() => setHoveredField(null)}
            />
            {Boolean(errors.name?.message) && <p role="alert">{errors.name?.message}</p>}
          </div>
          <div className={styles.form__box}>
            <label className={styles.label__company} htmlFor="company">
              <span className={styles.label__field}>
                <span
                  className={`${styles.label__text}${hoveredField === "company" ? "" : styles["label__text--active"]}`}
                >
                  会社名
                </span>
                <span
                  className={`${styles.label__text}${hoveredField === "company" ? styles["label__text--active"] : ""}`}
                >
                  Company
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
              onFocus={activateTurnstile}
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
              onFocus={activateTurnstile}
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
              onFocus={activateTurnstile}
              onMouseEnter={() => setHoveredField("message")}
              onMouseLeave={() => setHoveredField(null)}
            />
            {Boolean(errors.message?.message) && <p role="alert">{errors.message?.message}</p>}
          </div>
          <PrivacyConsent isChecked={privacyAccepted} onChange={setPrivacyAccepted} />

          {turnstileSiteKey !== "" && shouldShowTurnstile && (
            <div className={styles.turnstile__wrapper}>
              <Turnstile
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setTurnstileLoadError(false);
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                  turnstileRef.current?.reset();
                }}
                onError={() => {
                  setTurnstileToken(null);
                  setTurnstileLoadError(true);
                }}
                options={{
                  theme: "light",
                  size: "normal",
                  language: "ja",
                }}
              />
              {turnstileLoadError && (
                <p role="alert" className={styles.error__message}>
                  セキュリティチェックの読み込みに失敗しました。ページを再読み込みするか、サイト管理者にドメイン設定（Cloudflare
                  Turnstile）の確認を依頼してください。
                </p>
              )}
            </div>
          )}

          {pdfFile !== null && estimateNumber !== null && estimateNumber.trim() !== "" && (
            <div className={`${styles.form__box} ${styles.pdf__attachment}`}>
              <p className={styles.pdf__attachment__text}>
                <span className={styles.pdf__attachment__emoji}>📋</span> 見積書PDF添付: <strong>{pdfFile.name}</strong>{" "}
                ({Math.round(pdfFile.size / 1024)}KB)
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
