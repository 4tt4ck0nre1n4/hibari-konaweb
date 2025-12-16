import { useEffect, useRef } from "react";
import hamburgerStyles from "../styles/hamburgerStyles.module.css";

const HamburgerMenuLogo = () => {
  const clockCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const clockCircle = clockCircleRef.current;
    if (!clockCircle) return;

    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    let colorIndex = 0;

    // SVG circle の設定
    clockCircle.style.strokeDasharray = circumference.toString();
    clockCircle.style.stroke = "#4ecdc4"; // 初期色を設定

    function updateClock() {
      if (!clockCircle) return;

      const now = new Date();
      const seconds = now.getSeconds();

      // 15秒ごとに完全な円を描く
      const progress = (seconds % 15) / 15;
      const offset = circumference * (1 - progress);

      clockCircle.style.strokeDashoffset = offset.toString();

      // 15秒完了時に色をチェンジ（順番に）
      if (seconds % 15 === 0 && seconds !== 0) {
        const colors: readonly string[] = [
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#ffeaa7",
          "#fd79a8",
          "#fdcb6e",
          "#6c5ce7",
          "#a29bfe",
        ];
        const currentColor = colors[colorIndex];
        if (currentColor !== undefined) {
          colorIndex = (colorIndex + 1) % colors.length;
          clockCircle.style.stroke = currentColor;
        }
      }
    }

    // 初回実行
    updateClock();

    // 1秒ごとに更新
    const intervalId = setInterval(updateClock, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <a className={hamburgerStyles.hamburger__logo_link} href="/" aria-label="ホームに戻る" title="ホームに戻る">
      <div className={hamburgerStyles.hamburger__logo_container}>
        <img
          className={hamburgerStyles.hamburger__logo_image}
          src="/favicon.svg"
          alt="ロゴ画像"
          loading="lazy"
          decoding="async"
        />
        <svg
          className={hamburgerStyles.hamburger__clock_animation}
          viewBox="0 0 60 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            ref={clockCircleRef}
            className={hamburgerStyles.hamburger__clock_circle}
            cx="30"
            cy="30"
            r="28"
            fill="none"
            strokeWidth="2"
            strokeDasharray="176"
            strokeDashoffset="176"
          />
        </svg>
      </div>
      <img
        className={hamburgerStyles.hamburger__logo_text}
        src="/logo_text.svg"
        alt="ロゴテキスト"
        loading="lazy"
        decoding="async"
      />
    </a>
  );
};

export default HamburgerMenuLogo;
