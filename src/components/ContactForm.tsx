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

export default function ContactForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [hoveredField, setHoveredField] = useState<"name" | "email" | "message" | null>(null);

  const [hoveredSubmit, setHoveredSubmit] = useState(false);
  // const [hoveredSubmit, setHoveredSubmit] = useState<"submit" | null>("submit");

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

    await fetch(CONTACT_WPCF7_API, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log(response);
        window.location.replace(THANKS_URL);
        return response.text();
      })
      .then((text) => {
        console.log(text);
        console.log(JSON.parse(text));
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
