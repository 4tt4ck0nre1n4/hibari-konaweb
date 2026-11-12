import githubLogoBlack from "@/assets/icons/GitHub_Invertocat_Black.svg";
import githubLogoWhite from "@/assets/icons/GitHub_Invertocat_White.svg";
import cursorLogoLight from "@/assets/icons/Cursor_CUBE_2D_LIGHT.svg";
import cursorLogoDark from "@/assets/icons/Cursor_CUBE_2D_DARK.svg";
import geminiLogo from "@/assets/icons/Google_Gemini_icon_2025.svg";
import openaiLogoBlack from "@/assets/icons/OAI_OpenAI-Blossom_Black.svg";
import openaiLogoWhite from "@/assets/icons/OAI_OpenAI-Blossom_White.svg";
import cssLogo from "@/assets/icons/Official_CSS_Logo.svg";

export interface SkillsProps {
  className: string;
  icon: string;
  /** 公式ロゴのSVGアセット（ライトモード用） */
  iconSrc?: string;
  /** 公式ロゴのSVGアセット（ダークモード用） */
  iconDarkSrc?: string;
  item: string;
}
export const html = {
  className: "html",
  icon: "devicon:html5",
  item: "HTML",
};
export const css = {
  className: "css",
  icon: "",
  // 公式ロゴ（CSS Logo）。カラーロゴのためライト・ダーク共通
  iconSrc: cssLogo.src,
  item: "CSS",
};
export const sass = {
  className: "sass",
  icon: "devicon:sass",
  item: "Sass",
};
export const javascript = {
  className: "javascript",
  icon: "devicon:javascript",
  item: "JavaScript",
};
export const typescript = {
  className: "typescript",
  icon: "devicon:typescript",
  item: "TypeScript",
};
export const jquery = {
  className: "jquery",
  icon: "devicon:jquery",
  item: "jQuery",
};
export const wordpress = {
  className: "wordpress",
  icon: "logos:wordpress-icon",
  item: "WordPress",
};
export const swiper = {
  className: "swiper",
  icon: "devicon:swiper",
  item: "Swiper",
};
export const gsap = {
  className: "gsap",
  icon: "logos:greensock-icon",
  item: "GSAP",
};
export const react = {
  className: "react",
  icon: "devicon:react",
  item: "React",
};
export const canva = {
  className: "canva",
  icon: "devicon:canva",
  item: "Canva",
};
export const adobexd = {
  className: "adobexd",
  icon: "devicon:xd",
  item: "Adobe XD",
};
export const figma = {
  className: "figma",
  icon: "devicon:figma",
  item: "Figma",
};
export const gulp = {
  className: "gulp",
  icon: "logos:gulp",
  item: "Gulp",
};
export const vite = {
  className: "vite",
  icon: "devicon:vitejs",
  item: "Vite",
};
export const astro = {
  className: "astro",
  icon: "devicon:astro",
  item: "Astro",
};
export const vscode = {
  className: "vscode",
  icon: "devicon:vscode",
  item: "VScode",
};
export const netlify = {
  className: "netlify",
  icon: "logos:netlify-icon",
  item: "Netlify",
};
export const github = {
  className: "github",
  icon: "",
  // 公式ロゴ（https://github.com/logos）。ライト=黒版 / ダーク=白版
  iconSrc: githubLogoBlack.src,
  iconDarkSrc: githubLogoWhite.src,
  item: "Github",
  link: "/sorry",
};
export const cursor = {
  className: "cursor",
  icon: "",
  // 公式ロゴ（Cursor ブランドアセット CUBE 2D）。ライト=LIGHT版（濃色） / ダーク=DARK版（淡色）
  iconSrc: cursorLogoLight.src,
  iconDarkSrc: cursorLogoDark.src,
  item: "Cursor",
};
export const vercel = {
  className: "vercel",
  icon: "devicon:vercel",
  item: "Vercel",
};
export const filezilla = {
  className: "filezilla",
  icon: "devicon:filezilla",
  item: "FileZilla",
};
export const chatgpt = {
  className: "chatgpt",
  icon: "",
  // 公式ロゴ（OpenAI Blossom）。ライト=黒版 / ダーク=白版
  iconSrc: openaiLogoBlack.src,
  iconDarkSrc: openaiLogoWhite.src,
  item: "ChatGPT",
};
export const gemini = {
  className: "gemini",
  icon: "",
  // 公式ロゴ（Google Gemini icon 2025）。カラーロゴのためライト・ダーク共通
  iconSrc: geminiLogo.src,
  item: "Gemini",
};
export const claude = {
  className: "claude",
  icon: "logos:claude-icon",
  item: "Claude",
};
