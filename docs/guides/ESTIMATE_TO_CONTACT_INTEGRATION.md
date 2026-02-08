# 見積書からお問い合わせフォームへの連携ガイド

このドキュメントは、概算見積書からお問い合わせフォームへの連携方法、PDF生成機能の実装、Contact Form 7との統合について詳細に解説します。

**⚠️ 重要な変更**: 2026-02-09にPDF生成方法を **jsPDF** から **html2pdf.js** に変更しました。

## 目次

1. [概要](#概要)
2. [現在の実装状況](#現在の実装状況)
3. [PDF生成機能の実装（html2pdf.js）](#pdf生成機能の実装html2pdfjs)
4. [Contact Form 7との連携](#contact-form-7との連携)
5. [セキュリティとバリデーション](#セキュリティとバリデーション)
6. [トラブルシューティング](#トラブルシューティング)
7. [従来の実装（jsPDF）](#従来の実装jspdf)

---

## 概要

### 実現する機能

1. **見積書のPDF生成**: 表示されている見積書をhtml2pdf.jsで画像化してPDF生成
2. **PDFのダウンロード**: ユーザーがローカルに保存できる
3. **お問い合わせフォームへの遷移**: PDFデータを保持したままフォームへ移動
4. **CF7でのファイル受信**: Contact Form 7でPDFファイルを受け取る

### ユーザーフロー

```
┌────────────────────────┐
│ 料金シミュレーター     │
│ (項目選択・計算)       │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 「概算見積書を作成」   │
│ ボタンをクリック       │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 概算見積書表示         │
│ ・印刷ボタン           │
│ ・PDFダウンロード      │
│ ・お問い合わせボタン   │
└──────────┬─────────────┘
           │
           ├─「印刷」→ 印刷プレビュー
           │
           ├─「PDFダウンロード」
           │         │
           │         ▼
           │ ┌────────────────────────┐
           │ │ PDF生成（html2pdf.js） │
           │ │ HTML→画像→PDF変換      │
           │ └──────────┬─────────────┘
           │            │
           │            ▼
           │   PDFファイルダウンロード
           │
           └─「お問い合わせ」
                    │
                    ▼
           ┌────────────────────────┐
           │ PDF生成（html2pdf.js） │
           │ HTML要素を画像化       │
           └──────────┬─────────────┘
                      │
                      ▼
           ┌────────────────────────┐
           │ SessionStorage保存     │
           │ (Base64エンコード)     │
           └──────────┬─────────────┘
                      │
                      ▼
           ┌────────────────────────┐
           │ お問い合わせフォーム   │
           │ (PDF添付済み)          │
           └────────────────────────┘
```

---

## 現在の実装状況

### 実装済み機能

✅ **概算見積書の表示**  
✅ **印刷機能** (`window.print()`)  
✅ **PDFダウンロード機能** (html2pdf.js使用)  
✅ **PDFデータのフォームへの受け渡し** (SessionStorage経由)  
✅ **CF7でのファイルアップロード対応**  
✅ **Flamingoでの受信メッセージ保存**

### html2pdf.js を選択した理由

| 要件 | html2pdf.js | jsPDF（テキストベース） |
|------|-------------|----------------------|
| 日本語対応 | ✅ 完璧 | ❌ フォント埋め込み必要 |
| CSS適用 | ✅ 完全反映 | ❌ 独自API必要 |
| 実装の簡単さ | ✅ 非常にシンプル | ❌ 複雑 |
| デザインの一致 | ✅ 100%一致 | ❌ ずれやすい |

---

## PDF生成機能の実装（html2pdf.js）

### 1. パッケージのインストール

```bash
npm install html2pdf.js
npm install --save-dev @types/html2pdf.js
```

### 2. PDF生成関数の実装

**ファイル**: `src/utils/generatePDF.ts`

```typescript
import html2pdf from 'html2pdf.js';

/**
 * HTML要素からPDFを生成（html2pdf.js使用）
 * HTML要素をそのまま画像化してPDFに変換するため、デザインが完璧に再現されます
 */
export function generateEstimatePDFFromHTML(
  element: HTMLElement,
  estimateNumber: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `estimate_${estimateNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,           // 高解像度化（文字がぼやけない）
        useCORS: true,      // 外部画像の読み込み許可
        logging: false,     // デバッグログを無効化
        backgroundColor: '#ffffff',  // 背景色を明示
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,     // ファイルサイズ圧縮
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf('blob')
      .then((blob: Blob) => {
        // ファイルサイズチェック（5MB制限）
        const MAX_PDF_SIZE = 5 * 1024 * 1024;
        if (blob.size > MAX_PDF_SIZE) {
          reject(new Error('PDFファイルサイズが大きすぎます（最大5MB）'));
        } else {
          resolve(blob);
        }
      })
      .catch(reject);
  });
}
```

**重要ポイント**:
- `scale: 2`: 解像度を2倍にして文字を鮮明に
- `useCORS: true`: ロゴや画像の読み込みを許可
- `quality: 0.98`: 高品質JPEG（0.8～1.0で調整可能）
- `compress: true`: PDFファイルを圧縮

### 3. EstimateDocumentコンポーネントの実装

**ファイル**: `src/components/EstimateDocument.tsx`

```typescript
import { useRef } from 'react';
import { generateEstimatePDFFromHTML } from '../utils/generatePDF';

export function EstimateDocument({ estimateData }: EstimateDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    try {
      if (!documentRef.current) {
        alert('見積書要素が見つかりません。');
        return;
      }

      // ボタンを一時的に非表示（PDFに含めないため）
      const buttons = documentRef.current.querySelector('.estimate-document__actions');
      if (buttons) {
        (buttons as HTMLElement).style.display = 'none';
      }

      // PDF生成
      const blob = await generateEstimatePDFFromHTML(
        documentRef.current,
        estimateData.estimateNumber
      );

      // ボタンを再表示
      if (buttons) {
        (buttons as HTMLElement).style.display = '';
      }

      // ダウンロード
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate_${estimateData.estimateNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  const handleContact = async () => {
    try {
      if (!documentRef.current) {
        alert('見積書要素が見つかりません。');
        return;
      }

      // ボタンを一時的に非表示
      const buttons = documentRef.current.querySelector('.estimate-document__actions');
      if (buttons) {
        (buttons as HTMLElement).style.display = 'none';
      }

      // PDF生成
      const blob = await generateEstimatePDFFromHTML(
        documentRef.current,
        estimateData.estimateNumber
      );

      // ボタンを再表示
      if (buttons) {
        (buttons as HTMLElement).style.display = '';
      }

      // BlobをBase64に変換してSessionStorageに保存
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem('estimatePDF', base64data);
        sessionStorage.setItem('estimateNumber', estimateData.estimateNumber);
        window.location.href = '/contact';
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  return (
    <div className="estimate-document" ref={documentRef}>
      {/* 見積書のHTML構造 */}
      
      <div className="estimate-document__actions no-print">
        <button onClick={handlePrint}>印刷する</button>
        <button onClick={handleDownloadPDF}>PDFダウンロード</button>
        <button onClick={handleContact}>お問い合わせ</button>
      </div>
    </div>
  );
}
```

**実装のポイント**:
1. `useRef`でHTML要素への参照を取得
2. PDF生成前にボタンを非表示
3. PDF生成後にボタンを再表示
4. `async/await`で非同期処理を管理

### 4. html2pdf.js のメリットとデメリット

#### メリット
✅ HTML要素をそのまま画像化してPDF化  
✅ ブラウザでレンダリングされたデザインが完璧に再現  
✅ 日本語フォント問題が完全に解決  
✅ CSSが自動的に適用される  
✅ 実装が非常にシンプル

#### デメリット
❌ PDFファイル内でテキスト選択ができない（画像化のため）  
❌ PDFファイル内でテキスト検索ができない  
❌ ファイルサイズがやや大きくなる可能性

### 5. ファイルサイズの調整

ファイルサイズが大きすぎる場合、以下のオプションを調整:

```typescript
const opt = {
  image: { 
    type: 'jpeg', 
    quality: 0.8  // 0.8～0.95に下げる（品質とサイズのバランス）
  },
  html2canvas: { 
    scale: 1.5  // 1～1.5に下げる（解像度を調整）
  },
};
```

---
    className="estimate-document__button estimate-document__button--print"
    onClick={handlePrint}
  >
    印刷する
  </button>
  <button
    type="button"
    className="estimate-document__button estimate-document__button--contact"
    onClick={handleContact}
  >
    お問い合わせ
  </button>
</div>
```

---

## PDF生成機能の実装

### 1. 必要なパッケージのインストール

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

### 2. 日本語フォントの準備

jsPDFはデフォルトで日本語をサポートしていないため、日本語フォントを追加する必要があります。

#### オプションA: 外部CDNを使用（簡単）

```html
<!-- public/index.html または Layout.astro -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

#### オプションB: 日本語フォントを埋め込む（推奨）

1. **フォントファイルの準備**

```bash
# NotoSansJPなどのフォントをダウンロード
mkdir -p public/fonts
# NotoSansJP-Regular.ttf を public/fonts/ に配置
```

2. **フォントをBase64に変換**

```bash
# オンラインツールを使用するか、Nodeスクリプトで変換
# https://www.giftofspeed.com/base64-encoder/
```

3. **フォントを登録**

```typescript
// src/utils/pdfFont.ts
import { jsPDF } from 'jspdf';

export function addJapaneseFont(doc: jsPDF) {
  // Base64エンコードされたフォントデータ
  const fontBase64 = 'AAEAAAALAIAAAwAwT1M...'; // 実際のBase64データ
  
  doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64);
  doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
  doc.setFont('NotoSansJP');
}
```

### 3. PDF生成ユーティリティの作成

**ファイル**: `src/utils/generatePDF.ts`

```typescript
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { EstimateData } from '../types/pricing';
import { COMPANY_INFO } from '../config/companyInfo';

/**
 * 見積書PDFを生成
 */
export function generateEstimatePDF(estimateData: EstimateData): jsPDF {
  // A4サイズでPDF作成
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 日本語フォントを設定（必要に応じて）
  // addJapaneseFont(doc);

  // タイトル
  doc.setFontSize(20);
  doc.text('概算見積書', 105, 20, { align: 'center' });

  // 発行日・見積番号
  doc.setFontSize(10);
  doc.text(`発行日: ${estimateData.issueDate}`, 20, 35);
  doc.text(`見積番号: ${estimateData.estimateNumber}`, 20, 42);
  doc.text(`有効期限: ${estimateData.expiryDate}`, 20, 49);

  // 会社情報
  doc.text(COMPANY_INFO.name, 150, 35);
  doc.text(COMPANY_INFO.website, 150, 42);

  // お客様名
  doc.setFontSize(12);
  doc.text('〇〇〇〇〇〇 御中', 20, 60);
  doc.setFontSize(10);
  doc.text('下記の通りお見積り申し上げます。', 20, 67);

  // 件名
  doc.text(`件名: ${estimateData.subject}`, 20, 77);

  // お見積金額
  doc.setFontSize(14);
  const totalAmount = formatPrice(estimateData.calculation.total);
  doc.text(`お見積金額: ${totalAmount}円`, 20, 87);

  // 明細テーブル
  const tableData = estimateData.calculation.items.map(item => [
    item.name,
    formatPrice(item.unitPrice),
    item.quantity.toString(),
    formatPrice(item.totalPrice),
  ]);

  doc.autoTable({
    startY: 95,
    head: [['品名', '単価', '数量', '金額']],
    body: [
      ['コーディング料金', '', '', ''],
      ...tableData,
    ],
    theme: 'grid',
    styles: {
      font: 'NotoSansJP', // 日本語フォント
      fontSize: 9,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
    },
  });

  // テーブルの終了位置を取得
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // 金額サマリー
  doc.text(`小計（税抜）: ${formatPrice(estimateData.calculation.subtotal)}円`, 20, finalY + 10);
  
  if (estimateData.isUrgent && estimateData.calculation.urgentFee > 0) {
    doc.text(
      `特急料金（20%）: ${formatPrice(estimateData.calculation.urgentFee)}円`,
      20,
      finalY + 17
    );
  }
  
  doc.text(`消費税（10%）: ${formatPrice(estimateData.calculation.tax)}円`, 20, finalY + 24);
  
  doc.setFontSize(12);
  doc.text(
    `合計（税込）: ${formatPrice(estimateData.calculation.total)}円`,
    20,
    finalY + 34
  );

  // 備考
  doc.setFontSize(9);
  doc.text('備考', 20, finalY + 45);
  doc.text('※ これは概算見積書です。実際の金額は詳細なヒアリング後に確定いたします。', 20, finalY + 52);
  doc.text('※ 価格は予告なく変更される場合があります。', 20, finalY + 59);
  doc.text('※ 本概算見積書の有効期限は発行日より30日間です。', 20, finalY + 66);

  return doc;
}

/**
 * 金額フォーマット
 */
function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

/**
 * PDFをダウンロード
 */
export function downloadPDF(doc: jsPDF, filename: string = 'estimate.pdf'): void {
  doc.save(filename);
}

/**
 * PDFをBlobとして取得
 */
export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

/**
 * PDFをBase64として取得（フォーム送信用）
 */
export function getPDFBase64(doc: jsPDF): string {
  return doc.output('dataurlstring');
}
```

### 4. EstimateDocumentコンポーネントの更新

**ファイル**: `src/components/EstimateDocument.tsx`

```typescript
import { generateEstimatePDF, downloadPDF, getPDFBlob } from '../utils/generatePDF';

export function EstimateDocument({ estimateData }: EstimateDocumentProps) {
  // ... 既存のコード

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = generateEstimatePDF(estimateData);
      const filename = `estimate_${estimateData.estimateNumber}.pdf`;
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  const handleContact = async () => {
    try {
      // PDFを生成してBlobとして取得
      const pdf = generateEstimatePDF(estimateData);
      const pdfBlob = getPDFBlob(pdf);
      
      // SessionStorageにPDFデータを保存（一時的）
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem('estimatePDF', base64data);
        sessionStorage.setItem('estimateNumber', estimateData.estimateNumber);
        
        // お問い合わせページへ遷移
        window.location.href = '/contact';
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    }
  };

  return (
    <div className="estimate-document">
      {/* ... 既存のコード */}

      <div className="estimate-document__actions no-print">
        <button
          type="button"
          className="estimate-document__button estimate-document__button--print"
          onClick={handlePrint}
        >
          印刷する
        </button>
        <button
          type="button"
          className="estimate-document__button estimate-document__button--download"
          onClick={handleDownloadPDF}
        >
          PDFダウンロード
        </button>
        <button
          type="button"
          className="estimate-document__button estimate-document__button--contact"
          onClick={handleContact}
        >
          お問い合わせ
        </button>
      </div>
    </div>
  );
}
```

### 5. 型定義の拡張

**ファイル**: `src/types/jspdf-autotable.d.ts`

```typescript
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}
```

---

## Contact Form 7との連携

### 1. お問い合わせページでのPDF受け取り

**ファイル**: `src/pages/contact/index.astro` または関連するコンポーネント

```typescript
// ContactForm.tsx
import { useEffect, useState } from 'react';

export function ContactForm() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [estimateNumber, setEstimateNumber] = useState<string>('');

  useEffect(() => {
    // SessionStorageからPDFデータを取得
    const pdfData = sessionStorage.getItem('estimatePDF');
    const estNumber = sessionStorage.getItem('estimateNumber');

    if (pdfData && estNumber) {
      // Base64データをBlobに変換
      fetch(pdfData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `estimate_${estNumber}.pdf`, {
            type: 'application/pdf',
          });
          setPdfFile(file);
          setEstimateNumber(estNumber);

          // SessionStorageをクリア
          sessionStorage.removeItem('estimatePDF');
          sessionStorage.removeItem('estimateNumber');
        });
    }
  }, []);

  return (
    <div className="contact-form">
      <h2>お問い合わせフォーム</h2>
      
      {pdfFile && (
        <div className="attached-estimate">
          <p>✅ 見積書が添付されています: {pdfFile.name}</p>
          <p>見積番号: {estimateNumber}</p>
        </div>
      )}

      {/* Contact Form 7のショートコード */}
      <div dangerouslySetInnerHTML={{ __html: '[contact-form-7 id="123"]' }} />
    </div>
  );
}
```

### 2. Contact Form 7の設定

#### CF7フォームタグの設定

```html
<!-- WordPressの管理画面 > お問い合わせ > コンタクトフォーム > フォームタグ編集 -->

<label> お名前 *
  [text* your-name] 
</label>

<label> メールアドレス *
  [email* your-email] 
</label>

<label> 見積番号
  [text estimate-number] 
</label>

<label> お問い合わせ内容
  [textarea your-message] 
</label>

<label> 見積書添付（最大5MB）
  [file estimate-pdf limit:5mb filetypes:pdf]
</label>

[submit "送信"]
```

#### CF7のメールテンプレート設定

**WordPressの管理画面 > お問い合わせ > コンタクトフォーム > メールタブ**

```
件名: [your-subject]

メッセージ本文:
差出人: [your-name] <[your-email]>
見積番号: [estimate-number]

お問い合わせ内容:
[your-message]

--
このメールは [_site_title] ([_site_url]) のお問い合わせフォームから送信されました

添付ファイル: [estimate-pdf]
```

### 3. JavaScriptでの動的ファイル添付

CF7は標準では動的なファイル添付に対応していないため、JavaScriptで拡張します。

**ファイル**: `src/scripts/contactFormIntegration.ts`

```typescript
/**
 * Contact Form 7にPDFファイルを動的に添付
 */
export function attachPDFToContactForm() {
  const pdfData = sessionStorage.getItem('estimatePDF');
  const estimateNumber = sessionStorage.getItem('estimateNumber');

  if (!pdfData || !estimateNumber) return;

  // Base64データをBlobに変換
  fetch(pdfData)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], `estimate_${estimateNumber}.pdf`, {
        type: 'application/pdf',
      });

      // ファイル入力フィールドを取得
      const fileInput = document.querySelector<HTMLInputElement>(
        'input[name="estimate-pdf"]'
      );

      if (fileInput) {
        // DataTransferを使用してファイルを設定
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // 見積番号を自動入力
        const estimateInput = document.querySelector<HTMLInputElement>(
          'input[name="estimate-number"]'
        );
        if (estimateInput) {
          estimateInput.value = estimateNumber;
        }

        // 視覚的フィードバック
        const container = fileInput.closest('.wpcf7-form-control-wrap');
        if (container) {
          const notice = document.createElement('p');
          notice.className = 'estimate-attached-notice';
          notice.textContent = `✅ 見積書が添付されました: estimate_${estimateNumber}.pdf`;
          notice.style.color = 'green';
          notice.style.marginTop = '0.5rem';
          container.appendChild(notice);
        }
      }

      // SessionStorageをクリア
      sessionStorage.removeItem('estimatePDF');
      sessionStorage.removeItem('estimateNumber');
    })
    .catch(error => {
      console.error('PDFファイルの添付に失敗しました:', error);
    });
}

// ページ読み込み時に実行
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', attachPDFToContactForm);
}
```

**Astroページでのスクリプト読み込み**:

```astro
---
// src/pages/contact/index.astro
---

<Layout>
  <div class="contact-page">
    <!-- Contact Form 7のショートコード -->
  </div>

  <script>
    import { attachPDFToContactForm } from '../../scripts/contactFormIntegration';
    attachPDFToContactForm();
  </script>
</Layout>
```

### 4. CF7プラグインの設定

#### ファイルアップロード設定

**WordPressの管理画面 > 設定 > Contact Form 7**

1. **ファイルサイズ制限**: 5MB（デフォルト）
2. **許可するファイルタイプ**: `pdf`
3. **アップロード先**: WordPressメディアライブラリ（任意）

#### セキュリティ設定

```php
// functions.php に追加

// CF7のファイルアップロードをセキュアに
add_filter('wpcf7_validate_file', 'custom_file_validation', 10, 2);
function custom_file_validation($result, $file) {
  $allowed_types = array('application/pdf');
  $file_type = wp_check_filetype($file['name']);
  
  if (!in_array($file_type['type'], $allowed_types)) {
    $result->invalidate($file, 'PDFファイルのみアップロード可能です。');
  }
  
  if ($file['size'] > 5 * 1024 * 1024) { // 5MB
    $result->invalidate($file, 'ファイルサイズは5MB以下にしてください。');
  }
  
  return $result;
}

// ファイル名をサニタイズ
add_filter('wpcf7_upload_file_name', 'sanitize_uploaded_filename');
function sanitize_uploaded_filename($filename) {
  return sanitize_file_name($filename);
}
```

---

## セキュリティとバリデーション

### 1. クライアント側のバリデーション

```typescript
// src/utils/generatePDF.ts

/**
 * 見積データのバリデーション
 */
export function validateEstimateData(estimateData: EstimateData): boolean {
  // 必須フィールドのチェック
  if (!estimateData.estimateNumber || !estimateData.issueDate) {
    console.error('見積番号または発行日が不足しています');
    return false;
  }

  // 金額の妥当性チェック
  if (estimateData.calculation.total < 0) {
    console.error('金額が不正です');
    return false;
  }

  // 項目数のチェック
  if (estimateData.calculation.items.length === 0) {
    console.error('項目が選択されていません');
    return false;
  }

  return true;
}

// EstimateDocument.tsx で使用
const handleContact = async () => {
  if (!validateEstimateData(estimateData)) {
    alert('見積データが不正です。');
    return;
  }
  // ... PDF生成処理
};
```

### 2. ファイルサイズの制限

```typescript
// src/utils/generatePDF.ts

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

export function getPDFBlob(doc: jsPDF): Blob {
  const blob = doc.output('blob');
  
  if (blob.size > MAX_PDF_SIZE) {
    throw new Error('PDFファイルサイズが大きすぎます（最大5MB）');
  }
  
  return blob;
}
```

### 3. SessionStorageのセキュリティ

```typescript
// SessionStorageデータの有効期限を設定
export function saveToSessionWithExpiry(
  key: string,
  value: string,
  expiryMinutes: number = 10
): void {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + expiryMinutes * 60 * 1000,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
}

export function getFromSessionWithExpiry(key: string): string | null {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    // 有効期限切れの場合は削除
    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    return null;
  }
}
```

### 4. サーバー側のバリデーション（WordPress）

```php
// functions.php

// CF7送信前のバリデーション
add_action('wpcf7_before_send_mail', 'validate_estimate_submission');
function validate_estimate_submission($contact_form) {
  $submission = WPCF7_Submission::get_instance();
  
  if ($submission) {
    $posted_data = $submission->get_posted_data();
    
    // 見積番号の形式チェック
    $estimate_number = $posted_data['estimate-number'];
    if (!preg_match('/^EST-\d{8}-\d{4}$/', $estimate_number)) {
      $submission->set_response('見積番号の形式が不正です。');
      $submission->set_status('validation_failed');
    }
    
    // PDFファイルのチェック
    $uploaded_files = $submission->uploaded_files();
    if (isset($uploaded_files['estimate-pdf'])) {
      $file_path = $uploaded_files['estimate-pdf'];
      $file_size = filesize($file_path);
      
      if ($file_size > 5 * 1024 * 1024) {
        $submission->set_response('ファイルサイズが大きすぎます。');
        $submission->set_status('validation_failed');
      }
    }
  }
}
```

---

## トラブルシューティング

### 問題1: PDFに日本語が表示されない

**症状**: 日本語文字が四角や文字化けになる

**原因**: jsPDFがデフォルトで日本語フォントをサポートしていない

**解決方法**:

1. 日本語対応のフォント（NotoSansJPなど）をBase64エンコード
2. `addFont()`で登録
3. `setFont()`でフォントを適用

```typescript
import { jsPDF } from 'jspdf';

const doc = new jsPDF();
doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64Data);
doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
doc.setFont('NotoSansJP');
```

### 問題2: PDFがダウンロードされない

**症状**: `downloadPDF()`を呼んでもダウンロードが開始されない

**原因**: ブラウザのポップアップブロック、またはCORSエラー

**解決方法**:

```typescript
// ユーザーアクションから直接呼び出す
const handleDownload = () => {
  try {
    const pdf = generateEstimatePDF(estimateData);
    pdf.save('estimate.pdf'); // doc.save() を直接使用
  } catch (error) {
    console.error(error);
    alert('ダウンロードに失敗しました。ポップアップブロックを解除してください。');
  }
};
```

### 問題3: SessionStorageのデータが取得できない

**症状**: お問い合わせページでPDFデータが見つからない

**原因**: 
- 別のタブで開いた
- ページ遷移前にSessionStorageがクリアされた
- プライベートブラウジングモード

**解決方法**:

```typescript
// お問い合わせページ (contact/index.astro)
useEffect(() => {
  const pdfData = sessionStorage.getItem('estimatePDF');
  
  if (!pdfData) {
    console.warn('PDFデータが見つかりません');
    // フォールバック処理
    const shouldRedirect = confirm('見積データがありません。シミュレーターに戻りますか？');
    if (shouldRedirect) {
      window.location.href = '/service';
    }
  }
}, []);
```

### 問題4: CF7でファイルが添付されない

**症状**: フォーム送信時にPDFファイルが含まれない

**原因**: 
- ファイル入力フィールドの`name`属性が正しくない
- メールテンプレートに`[estimate-pdf]`タグがない

**解決方法**:

1. CF7フォームタグ確認:
```html
[file estimate-pdf limit:5mb filetypes:pdf]
```

2. メールテンプレート確認:
```
添付ファイル: [estimate-pdf]
```

3. JavaScriptで正しく設定されているか確認:
```typescript
const fileInput = document.querySelector('input[name="estimate-pdf"]');
console.log('File input found:', fileInput);
console.log('Files:', fileInput?.files);
```

### 問題5: PDFのレイアウトが崩れる

**症状**: 生成されたPDFのレイアウトが見積書画面と異なる

**原因**: HTML/CSSとjsPDFの描画方法の違い

**解決方法**:

```typescript
// より正確なレイアウト制御
export function generateEstimatePDF(estimateData: EstimateData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // ページサイズを取得
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // 座標を計算しながら配置
  let currentY = margin;

  // タイトル（中央揃え）
  doc.setFontSize(20);
  const titleWidth = doc.getTextWidth('概算見積書');
  doc.text('概算見積書', (pageWidth - titleWidth) / 2, currentY);
  currentY += 15;

  // 以降も座標を計算して配置...
}
```

---

## 代替実装方法

### 方法1: html2canvas + jsPDF（簡単）

HTML要素をそのままPDF化する方法です。

```bash
npm install html2canvas jspdf
```

```typescript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePDFFromHTML(elementId: string): Promise<jsPDF> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('要素が見つかりません');

  // HTML要素をCanvasに変換
  const canvas = await html2canvas(element, {
    scale: 2, // 高解像度
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4幅
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  return pdf;
}

// 使用例
const handleDownloadPDF = async () => {
  try {
    const pdf = await generatePDFFromHTML('estimate-document');
    pdf.save('estimate.pdf');
  } catch (error) {
    console.error('PDF生成エラー:', error);
  }
};
```

**メリット**: 
- 実装が簡単
- HTMLのレイアウトをそのままPDF化

**デメリット**: 
- ファイルサイズが大きくなる
- テキストが画像になるため検索できない

### 方法2: サーバー側でPDF生成（推奨）

セキュリティとパフォーマンスの観点から、サーバー側でPDFを生成する方法が推奨されます。

```typescript
// クライアント側（EstimateDocument.tsx）
const handleContact = async () => {
  try {
    // サーバーにPDF生成をリクエスト
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estimateData }),
    });

    if (!response.ok) throw new Error('PDF生成に失敗しました');

    const blob = await response.blob();
    const pdfFile = new File([blob], `estimate_${estimateData.estimateNumber}.pdf`, {
      type: 'application/pdf',
    });

    // SessionStorageに保存
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem('estimatePDF', reader.result as string);
      window.location.href = '/contact';
    };
    reader.readAsDataURL(pdfFile);
  } catch (error) {
    console.error(error);
    alert('PDF生成エラー');
  }
};
```

```typescript
// サーバー側（Astro API Route: src/pages/api/generate-pdf.ts）
import type { APIRoute } from 'astro';
import PDFDocument from 'pdfkit';

export const POST: APIRoute = async ({ request }) => {
  const { estimateData } = await request.json();

  // PDFKitでPDF生成
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    // 返却
  });

  doc.fontSize(20).text('概算見積書', { align: 'center' });
  // ... PDF内容を構築
  doc.end();

  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=estimate.pdf',
    },
  });
};
```

### 方法3: WordPressプラグインを使用

WordPress側でPDF生成を処理する方法です。

**推奨プラグイン**:
- WP-PDF Templates
- PDF Generator for Contact Form 7

```php
// functions.php

// CF7送信時にPDFを自動生成
add_action('wpcf7_mail_sent', 'generate_pdf_on_form_submit');
function generate_pdf_on_form_submit($contact_form) {
  $submission = WPCF7_Submission::get_instance();
  $posted_data = $submission->get_posted_data();
  
  // 見積データを取得
  $estimate_number = $posted_data['estimate-number'];
  
  // PDFライブラリ（TCPDF、DOMPDFなど）を使用してPDF生成
  // ...
}
```

---

## まとめ

### 実装の推奨順序

1. **フェーズ1**: PDF生成機能（jsPDF）を実装
2. **フェーズ2**: PDFダウンロード機能を追加
3. **フェーズ3**: SessionStorageでお問い合わせページへデータ引き継ぎ
4. **フェーズ4**: CF7でのファイルアップロード対応
5. **フェーズ5**: セキュリティとバリデーション強化

### チェックリスト

- [ ] jsPDFとjspdf-autotableをインストール
- [ ] 日本語フォント対応
- [ ] PDF生成ユーティリティ作成
- [ ] EstimateDocumentコンポーネント更新
- [ ] SessionStorageでのデータ受け渡し実装
- [ ] お問い合わせページでPDF取得
- [ ] CF7フォームタグ設定
- [ ] CF7メールテンプレート設定
- [ ] JavaScriptでの動的ファイル添付
- [ ] セキュリティバリデーション実装
- [ ] エラーハンドリング実装
- [ ] 動作テスト（各ブラウザ）

---

**作成日**: 2026年02月08日  
**バージョン**: 1.0  
**関連ドキュメント**: PRICING_SIMULATOR_IMPLEMENTATION.md  
**ステータス**: PDF生成機能は未実装（実装ガイド提供済み）
