import { useState } from "react";
import PrivacyConsent from "./PrivacyConsent.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema } from "../scripts/validationSchema.ts";
import styles from "../styles/contactForm.module.css";
import { CONTACT_WPCF7_API, wpcf7Id, wpcf7UnitTag, wpcf7PostId } from "../api/headlessCms.ts";

const requiredMark = "【必須】";
const THANKS_URL = "/contact/thanks";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = handleSubmit(async (data: FormValues, event) => {
    if (!privacyAccepted) {
      alert("プライバシーポリシーに同意してください。");
      return;
    }

    const target = event?.target as HTMLFormElement | null;
    if (!target) return;

    event?.preventDefault();
    const formData = new FormData(target);
    formData.append("your-name", data.name);
    formData.append("your-email", data.email);
    formData.append("your-message", data.message);
    formData.append("_wpcf7_unit_tag", data.wpcf7_unit_tag);

    try {
      // デバッグ用: 送信先のエンドポイントをログ出力
      console.log("📤 [Contact Form] Sending POST request to:", CONTACT_WPCF7_API);

      const response = await fetch(CONTACT_WPCF7_API, {
        method: "POST",
        body: formData,
      });

      // ステータスコードを確認
      if (!response.ok) {
        const responseText = await response.text();
        console.error("❌ [Contact Form] HTTP Error Response:", {
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
        console.error("Failed to parse response:", responseText);
        throw new Error("サーバーからの応答が正しくありません。");
      }

      // レスポンスをコンソールに出力（デバッグ用）
      console.log("Contact Form 7 Response:", responseData);

      // Contact Form 7のレスポンスステータスを確認
      if (responseData.status === "mail_sent") {
        // メール送信成功時のみリダイレクト
        console.log("Mail sent successfully. Redirecting to thanks page...");
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
        console.error("Mail sending failed:", responseData);
        alert(
          "メール送信に失敗しました。しばらく時間をおいて再度お試しください。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      } else {
        // その他のエラー
        console.error("Unexpected response status:", responseData);
        alert(
          "送信処理中にエラーが発生しました。\n" +
            "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "送信処理中にエラーが発生しました。\n" +
          "ネットワーク接続を確認し、しばらく時間をおいて再度お試しください。\n" +
          "問題が解決しない場合は、直接 webengineer@hibari-konaweb.com までご連絡ください。"
      );
    }
  });

  return (
    <div className="wpcf7">
      <div className={styles.form__inner}>
        <form onSubmit={(e) => void onSubmit(e)}>
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

          <input
            className={styles.submit}
            type="submit"
            value={`${hoveredSubmit ? "送信" : "Submit"}`}
            aria-label={hoveredSubmit ? "送信" : "Submit"}
            onMouseEnter={() => setHoveredSubmit(true)}
            onMouseLeave={() => setHoveredSubmit(false)}
          />
        </form>
      </div>
    </div>
  );
}
