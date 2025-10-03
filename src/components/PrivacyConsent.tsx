import styles from "../styles/contactForm.module.css";

const requiredMark = "【必須】";

interface PrivacyConsentProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export default function PrivacyConsent({ isChecked, onChange }: PrivacyConsentProps) {
  return (
    <div>
      <label className={styles.label__checkbox} htmlFor="checkbox">
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          name=""
          id="checkbox"
        />
        <span className={styles.checkbox__text}>
          <a
            className={styles.checkbox__link}
            href="/privacy"
            target="_blank"
            aria-label="プライバシーポリシーページへ"
            title="プライバシーポリシーページへ"
          >
            プライバシーポリシー
          </a>
          に同意する
          <span className={styles.required}>{requiredMark}</span>
        </span>
      </label>
    </div>
  );
}
