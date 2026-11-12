import xLogoBlack from "@/assets/icons/x-logo-black.svg";
import xLogoWhite from "@/assets/icons/x-logo-white.svg";
import githubLogoBlack from "@/assets/icons/GitHub_Invertocat_Black.svg";
import githubLogoWhite from "@/assets/icons/GitHub_Invertocat_White.svg";

// ============================================================
// ボタンアイコン定数（旧: data/constButton.ts）
// ============================================================

export const play = {
  icon: "octicon:play-24",
};
export const pause = {
  icon: "carbon:pause-outline",
};
export const reverse = {
  icon: "ion:play-back-circle-outline",
};
export const restart = {
  icon: "solar:restart-circle-outline",
};

// ============================================================
// SNSリンク定数（旧: data/constSns.ts）
// ============================================================

export interface SnsProps {
  className: string;
  href: string;
  icon: string;
  src: string;
  item: string;
  ariaLabel: string;
  ariaTitle: string;
  ariaHidden: boolean;
  targetBlank: string;
}

const logoSvg = "/favicon.svg";

/**
 * 公式ブランドロゴ（X / GitHub）
 * - X: https://about.x.com/ja/who-we-are/brand-toolkit （配布は白版のみ。黒版は fill のみ black に変更）
 * - GitHub: https://github.com/logos （Invertocat 黒版・白版）
 * ブランドガイドラインにより、ロゴは黒または白の単色で使用し、形状・色を加工しない。
 * ライトモードでは黒版（icon）、ダークモードでは白版（iconDark）を表示する。
 */
export const twitter = {
  className: "sns-icon__link",
  href: "/sorry",
  icon: xLogoBlack.src,
  iconDark: xLogoWhite.src,
  item: "X(Twitter)",
  ariaLabel: "X(Twitter)ページへ(新しいタブで開く)",
  ariaTitle: "X(Twitter)ページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
export const github_sns = {
  className: "sns-icon__link",
  href: "https://github.com/4tt4ck0nre1n4",
  icon: githubLogoBlack.src,
  iconDark: githubLogoWhite.src,
  item: "Github",
  ariaLabel: "Githubページへ(新しいタブで開く)",
  ariaTitle: "Githubページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
export const notion = {
  className: "sns-icon__link",
  href: "/sorry",
  icon: "devicon:notion",
  item: "Notion",
  ariaLabel: "Notionページへ(新しいタブで開く)",
  ariaTitle: "Notionページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
export const instagram = {
  className: "sns-icon__link",
  href: "/sorry",
  icon: "fa6-brands:instagram",
  item: "Instagram",
  ariaLabel: "Instagramページへ(新しいタブで開く)",
  ariaTitle: "Instagramページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
export const about = {
  className: "sns-icon__link",
  href: "/about",
  icon: logoSvg,
  item: "About Page",
  ariaLabel: "Aboutページへ",
  ariaTitle: "Aboutページへ",
};
export const aboutPage = {
  className: "sns-icon__link",
  href: "/about",
  icon: "fa6-solid:cat",
  item: "About Page",
  ariaLabel: "アバウトページへ",
  ariaTitle: "アバウトページへ",
};
export const contact = {
  className: {
    about: "sns-icon__link",
    footer: "footer-icon__link",
  },
  href: "/contact",
  icon: "ic:baseline-contact-mail",
  item: {
    about: "Contact",
    footer: "Contact Page",
  },
  ariaLabel: "お問い合わせページへ",
  ariaTitle: "お問い合わせページへ",
};
export const mail = {
  className: {
    about: "sns-icon__link",
    footer: "footer-icon__link",
  },
  href: "mailto:webengineer@hibari-konaweb.com",
  icon: "fa6-solid:envelope",
  item: {
    about: "Email",
    footer: "webengineer@hibari-konaweb.com",
  },
  mail: "webengineer@hibari-konaweb.com",
  ariaLabel: "メールページへ(新しいタブで開く)",
  ariaTitle: "メールページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
