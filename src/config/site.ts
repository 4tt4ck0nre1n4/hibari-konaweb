import { validateConfigData, companyInfoSchema, estimateConfigSchema } from "@/schemas/data.schema";

// ============================================================
// サイト全体の設定（旧: data/globalText.json）
// SEO・OGP・各ページのタイトル・説明文など
// ============================================================
export const SITE = {
  url: "https://hibari-konaweb.netlify.app",
  global: {
    themeColor: "",
    colorScheme: "light dark",
    author: "hibari-konaweb.com",
    robots: "",
    formatDetection: "telephone=no, address=no",
  },
  link: {
    sitemap: "/sitemap-index.xml",
    author: "https://hibari-konaweb.netlify.app",
    canonical: "https://hibari-konaweb.netlify.app",
  },
  og: {
    local: "ja_JP",
    title: "My Portfolio Site",
    description:
      "ポートフォリオサイトをご覧いただきありがとうございます。Web制作などお仕事に関するご相談、お見積りはお気軽にお問い合わせください。",
    type: "website",
    url: "https://hibari-konaweb.netlify.app",
    image: "https://hibari-konaweb.netlify.app/assets/screenshot.webp",
    site_name: "My Portfolio Site",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Portfolio Site",
    description:
      "ポートフォリオサイトをご覧いただきありがとうございます。Web制作などお仕事に関するご相談、お見積りはお気軽にお問い合わせください。",
    site: "https://hibari-konaweb.netlify.app",
    image: "https://hibari-konaweb.netlify.app/assets/screenshot.webp",
  },
  local: {
    type: "article",
  },
  top: {
    title: "My Portfolio Site",
    description:
      "ポートフォリオサイトをご覧いただきありがとうございます。Web制作などお仕事に関するご相談、お見積りはお気軽にお問い合わせください。",
  },
  about: {
    title: "About | My Portfolio Site",
    description: "私について、スキル、サービスを紹介しています。",
  },
  works: {
    title: "Works | My Portfolio Site",
    description: "私の活動の履歴、実績、作品を紹介しています。",
  },
  blog: {
    title: "Blog | My Portfolio Site",
    description: "ブログの記事一覧です。",
    error: "申し訳ございません。ブログの記事一覧のデータを読み込むことができませんでした。もう一度お試しください。",
    postCtaHeading: "あなたのビジネス課題をWebで解決しませんか？",
    postCtaDescription:
      "この記事で紹介した技術を用いたサイト構築や、現状のWebサイトの改善提案を行っています。まずは無料でお気軽にご相談ください。",
    postCtaBadge: "Web制作・システム開発のご相談",
    postCtaContactButton: "無料相談・お問い合わせ",
    postCtaWorksButton: "制作実績を見る →",
    authorName: "hibari-konaweb.com",
    profileName: "",
    profileTagline: "フロントエンドエンジニア",
    profileBio:
      "クリエイティビティ × AI × ビジネス。成果に直結するWebサイトやアプリケーションを制作しています。Astro / React 等が得意です。",
  },
  categories: {
    title: "Categories | My Portfolio Site",
    description: "ブログのカテゴリー記事一覧です。",
    /**
     * Headless CMS のカテゴリーに個別の説明（ACF 等）がないとき、`/blog/category/[slug]` の meta description に使う。
     * `{categoryName}` を実際のカテゴリー名に置換して使う。
     */
    metaDescriptionSlugTemplate:
      "「{categoryName}」カテゴリーに分類されたブログ記事の一覧です。Web制作・フロントエンド・デザインなど、テーマ別に記事を紹介しています。",
    /**
     * `/blog/category` の meta description を WordPress カテゴリーの「説明」から取るときの slug。
     * このカテゴリーは一覧のカードには出さない（SEO 用のダミー想定）。空文字なら `description` は上の固定文＋フォールバック。
     * Netlify では `PUBLIC_CATEGORY_INDEX_SEO_CATEGORY_SLUG` でも上書き可。
     */
    seoOnlyCategorySlug: "" as string,
  },
  contact: {
    title: "Contact | My Portfolio Site",
    description:
      "Web制作などのお仕事に関するご相談、お見積りやポートフォリオの感想など、お問い合わせはこちらのフォームからお願いします。メール受付後、1～3営業日以内にメールで返答させていただきます。",
  },
  service: {
    title: "Service | My Portfolio Site",
    description: "Web制作などのお仕事に関する私のサービス内容と料金表を紹介しています。",
    simulatorLeadCardTitle: "プランを選んで、タップするだけ。",
    simulatorLeadCardSubtitle:
      "その場でわかる料金シミュレーター。概算金額がすぐに確認でき、そのまま見積書の作成まで進められます。",
    simulatorLeadStepLabels: ["プランを選ぶ", "項目をタップ", "見積書を作成"],
    simulatorLeadBenefits: ["最短30秒", "ステップが視覚的", "簡単に見積書を作成"],
    simulatorContactNote: "正式なお見積りや仕様のすり合わせは、",
    simulatorContactHref: "/contact",
    simulatorContactLinkLabel: "お問い合わせフォームからご相談ください。",
  },
  thanks: {
    title: "Thanks | My Portfolio Site",
    description:
      "お問い合わせありがとうございます。ご記入していただいた情報は無事に送信されました。確認のため、お客様に自動返信メールをお送りしております。",
  },
  privacy: {
    title: "Privacy Policy | My Portfolio Site",
    description:
      "プライバシーポリシー（以下、「本ポリシー」といいます。）は、当サイトがどのような個人情報を取得し、どのように利用するか、どのように個人情報を管理するのかをユーザーにご説明するものです。当サイトは本ポリシーに従い、個人情報の安全管理のために必要かつ適切な取り扱いと保護に努めます。",
  },
  sorry: {
    title: "Sorry... | My Portfolio Site",
    description:
      "申し訳ございません。このページは準備中です。当サイトをご覧いただきありがとうございます。各ページは随時更新しております。しばらくお待ちください。",
  },
  notFound404: {
    title: "404 Not Found | My Portfolio Site",
    description:
      "お探しのページが見つかりませんでした。アクセスしようとしたページは削除、変更されたか、現在利用できない可能性があります。直接アドレスを入力された場合は、アドレスが正しく入力されているかもう一度ご確認ください。",
  },
  serverError500: {
    title: "500 Server Error | My Portfolio Site",
    description: "サーバー側で何らかの予期しないエラーが発生しました。",
  },
} as const;

// ============================================================
// 会社情報・見積設定（旧: config/companyInfo.ts）
// SITE.url / SITE.global.author を参照して重複を解消
// ============================================================

const COMPANY_INFO_RAW = {
  name: SITE.global.author,
  website: SITE.url,
  registrationNumber: "" as string,
};

export const COMPANY_INFO = validateConfigData(companyInfoSchema, COMPANY_INFO_RAW, "COMPANY_INFO");

const ESTIMATE_CONFIG_RAW = {
  title: "Webサイト制作に関する概算お見積書",
  subject: "Webサイト制作に関するお見積り",
  validityDays: 30,
  taxRate: 0.1,
  urgentFeeRate: 0.2,
  disclaimer: [
    "この見積書は概算です。正式なお見積りは別途ご案内いたします。",
    "ご不明な点がございましたら、お気軽にお問い合わせください。",
  ],
  notes: [
    "・上記金額には、消費税が含まれております。",
    "・お支払い条件:着手金50%、納品時50%（応相談）",
    "・納期:プロジェクト内容により変動(別途ご相談)",
    "・上記以外の機能や追加のご要望については、別途お見積りさせていただきます。",
    "・本見積書は、発行日より30日間有効です。",
  ],
} as const;

export const ESTIMATE_CONFIG = validateConfigData(estimateConfigSchema, ESTIMATE_CONFIG_RAW, "ESTIMATE_CONFIG");
