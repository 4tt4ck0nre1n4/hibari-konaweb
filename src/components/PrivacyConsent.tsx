import styles from "../styles/contactForm.module.css";

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
        <span>
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
          <span className={styles.required}>&#10035;</span>
        </span>
      </label>
    </div>
  );
}
