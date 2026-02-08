// 会社情報
export const COMPANY_INFO = {
  name: 'hibari-konaweb.com',
  website: 'https://hibari-konaweb.netlify.app',
  registrationNumber: '' as string,
};

// 見積書設定
export const ESTIMATE_CONFIG = {
  title: 'Webサイト制作に関する概算お見積書',
  subject: 'Webサイト制作に関するお見積り',
  validityDays: 30,
  taxRate: 0.1,
  urgentFeeRate: 0.2,
  disclaimer: [
    'この見積書は概算です。正式なお見積りは別途ご案内いたします。',
    'ご不明な点がございましたら、お気軽にお問い合わせください。',
  ],
  notes: [
    '・上記金額には、消費税が含まれております。',
    '・お支払い条件：着手金50%、納品時50%（応相談）',
    '・納期：プロジェクト内容により変動（別途ご相談）',
    '・上記以外の機能や追加のご要望については、別途お見積りさせていただきます。',
    '・本見積書は、発行日より30日間有効です。',
  ],
} as const;
