export interface SnsProps {
  className: string;
  href: string;
  icon: string;
  item: string;
  ariaLabel: string;
  ariaTitle: string;
  ariaHidden: boolean;
  targetBlank: string;
}

// export const ariaHidden = "true";

export const twitter = {
  className: "sns-icon__link",
  href: "/sorry",
  icon: "devicon:twitter",
  item: "X(Twitter)",
  ariaLabel: "X(Twitter)ページへ(新しいタブで開く)",
  ariaTitle: "X(Twitter)ページへ(新しいタブで開く)",
  targetBlank: "_blank",
};
export const github_sns = {
  className: "sns-icon__link",
  href: "https://github.com/4tt4ck0nre1n4",
  icon: "bi:github",
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
