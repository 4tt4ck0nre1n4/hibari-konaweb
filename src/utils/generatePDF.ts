import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EstimateData } from '../types/pricing';
import { COMPANY_INFO } from '../config/companyInfo';

/**
 * autoTable の lastAutoTable プロパティの型定義
 */
interface AutoTableDoc {
  lastAutoTable?: { finalY: number };
}

/**
 * 金額フォーマット
 */
function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

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

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // タイトル
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleText = '概算見積書';
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, currentY);
  currentY += 15;

  // 発行日・見積番号（左側）
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`発行日: ${estimateData.issueDate}`, 20, currentY);
  doc.text(`見積番号: ${estimateData.estimateNumber}`, 20, currentY + 7);
  doc.text(`有効期限: ${estimateData.expiryDate}`, 20, currentY + 14);

  // 会社情報（右側）
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, pageWidth - 20, currentY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.website, pageWidth - 20, currentY + 7, { align: 'right' });

  const regNumber: string = COMPANY_INFO.registrationNumber;
  if (regNumber !== '' && regNumber.length > 0) {
    doc.text(`登録番号: ${regNumber}`, pageWidth - 20, currentY + 14, {
      align: 'right',
    });
  }

  currentY += 25;

  // お客様名
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('〇〇〇〇〇〇 御中', 20, currentY);
  currentY += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('下記の通りお見積り申し上げます。', 20, currentY);
  currentY += 10;

  // 件名
  doc.text(`件名: ${estimateData.subject}`, 20, currentY);
  currentY += 10;

  // お見積金額
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const totalAmount = formatPrice(estimateData.calculation.total);
  doc.text(`お見積金額: ${totalAmount}円`, 20, currentY);
  currentY += 10;

  // 明細テーブル
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // 両プランの明細を結合（ホームページ制作 → コーディングの順）
  const allItems = [
    ...estimateData.calculation.designItems,
    ...estimateData.calculation.codingItems,
  ];
  const tableData = allItems.map(item => [
    item.name,
    `${formatPrice(item.unitPrice)}円`,
    item.quantity.toString(),
    `${formatPrice(item.totalPrice)}円`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['品名', '単価', '数量', '金額']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // テーブルの終了位置を取得
  const finalY = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? currentY) + 50;
  currentY = finalY + 10;

  // 税別内訳テーブル
  autoTable(doc, {
    startY: currentY,
    head: [['税別内訳', '小計（税抜金額）', '小計（税のみ）']],
    body: [
      ['10%対象分', `${formatPrice(estimateData.calculation.subtotal)}円`, `${formatPrice(estimateData.calculation.tax)}円`],
      ['8%対象分', '-', '-'],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 55, halign: 'right' },
      2: { cellWidth: 55, halign: 'right' },
    },
  });

  const taxTableFinalY = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? currentY) + 30;
  currentY = taxTableFinalY + 10;

  // 金額サマリー
  doc.setFontSize(10);
  const rightX = pageWidth - 20;

  doc.text(`小計（税抜）: ${formatPrice(estimateData.calculation.subtotal)}円`, rightX, currentY, {
    align: 'right',
  });
  currentY += 7;

  if (estimateData.isUrgent && estimateData.calculation.urgentFee > 0) {
    doc.setTextColor(255, 0, 0);
    doc.text(
      `特急料金（20%）: ${formatPrice(estimateData.calculation.urgentFee)}円`,
      rightX,
      currentY,
      { align: 'right' }
    );
    doc.setTextColor(0, 0, 0);
    currentY += 7;
  }

  doc.text(`消費税（10%）: ${formatPrice(estimateData.calculation.tax)}円`, rightX, currentY, {
    align: 'right',
  });
  currentY += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`合計（税込）: ${formatPrice(estimateData.calculation.total)}円`, rightX, currentY, {
    align: 'right',
  });
  currentY += 10;

  // 備考
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('備考', 20, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  const notes = [
    '※ これは概算見積書です。実際の金額は詳細なヒアリング後に確定いたします。',
    '※ 価格は予告なく変更される場合があります。',
    '※ 本概算見積書の有効期限は発行日より30日間です。',
    '',
    '【別途費用が発生する項目】',
    '■ 素材・ライセンス費用',
    '有料画像素材、プレミアムフォント等のライセンス購入が必要な場合は、実費を別途請求させていただきます。',
    '',
    '■ 仕様変更・追加開発',
    'お見積り後に仕様変更や追加機能のご要望が生じた場合は、内容を確認の上、別途お見積りいたします。',
    '',
    '■ その他実費',
    '交通費、宿泊費等は含まれておりません。別途発生する場合は実費請求とさせていただきます。',
    '',
    '【お支払いについて】',
    'お振込手数料は貴社にてご負担願います。',
  ];

  notes.forEach(note => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(note, 20, currentY, { maxWidth: pageWidth - 40 });
    currentY += 5;
  });

  return doc;
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
  const blob = doc.output('blob');

  // ファイルサイズチェック（5MB制限）
  const MAX_PDF_SIZE = 5 * 1024 * 1024;
  if (blob.size > MAX_PDF_SIZE) {
    throw new Error('PDFファイルサイズが大きすぎます（最大5MB）');
  }

  return blob;
}

/**
 * PDFをBase64として取得（フォーム送信用）
 */
export function getPDFBase64(doc: jsPDF): string {
  return doc.output('dataurlstring');
}

/**
 * 見積データのバリデーション
 */
export function validateEstimateData(estimateData: EstimateData): boolean {
  // 必須フィールドのチェック
  if (
    estimateData.estimateNumber === '' ||
    estimateData.estimateNumber.length === 0 ||
    estimateData.issueDate === '' ||
    estimateData.issueDate.length === 0
  ) {
    console.error('見積番号または発行日が不足しています');
    return false;
  }

  // 金額の妥当性チェック
  if (estimateData.calculation.total < 0) {
    console.error('金額が不正です');
    return false;
  }

  // 項目数のチェック（コーディング・ホームページ制作のいずれかに項目があればOK）
  const totalItems =
    estimateData.calculation.codingItems.length +
    estimateData.calculation.designItems.length;
  if (totalItems === 0) {
    console.error('項目が選択されていません');
    return false;
  }

  return true;
}

/**
 * PDF生成用スタイル（CSS変数を解決した値を直接指定）
 * Firefox等でcssRulesアクセスが失敗する場合に、クローンされた文書に注入して色・レイアウトを保証する
 */
const ESTIMATE_DOCUMENT_PDF_STYLES = `
.estimate-document {
  max-width: 900px;
  color: #010101;
  background-color: #f1f5f9;
  margin-inline: auto;
  padding-block: 3rem;
  padding-inline: 2rem;
}
.estimate-document__header {
  text-align: center;
  margin-block-start: 2rem;
}
.estimate-document__title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #4a90e2;
  margin: 0;
}
.estimate-document__main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-block-start: 2rem;
}
.estimate-document__client-name {
  font-size: 1.125rem;
  font-weight: 700;
  margin-block-start: 1rem;
  color: #010101;
}
.estimate-document__greeting {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #010101;
}
.estimate-document__info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}
.estimate-document__info-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #010101;
}
.estimate-document__info-label {
  font-weight: 600;
  color: #010101;
}
.estimate-document__company {
  text-align: right;
  border-block-end: #e0e0e0 1px solid;
  margin-block-start: 2rem;
  padding-block: 1rem;
}
.estimate-document__logo {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-block-start: 0.5rem;
}
.estimate-document__logo-icon {
  height: 2rem;
  width: auto;
}
.estimate-document__logo-text {
  height: 1.5rem;
  width: auto;
}
.estimate-document__website {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #010101;
}
.estimate-document__subject-section {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  margin-block-start: 2rem;
  padding-block: 1rem;
  padding-inline: 1rem;
}
.estimate-document__subject-row {
  display: flex;
  gap: 1rem;
  font-size: 0.9375rem;
  padding-block: 0.5rem;
  padding-inline: 0;
  color: #010101;
}
.estimate-document__subject-label {
  min-width: 80px;
  font-weight: 700;
  color: #010101;
}
.estimate-document__total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f1f5f9;
  background-color: #4a90e2;
  border-radius: 0.5rem;
  margin-block-start: 2rem;
  padding-block: 1.5rem;
  padding-inline: 2rem;
}
.estimate-document__total-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
}
.estimate-document__total-value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #f1f5f9;
}
.estimate-document__details {
  margin-block-start: 2rem;
}
.estimate-document__details-title {
  font-size: 1rem;
  font-weight: 700;
  margin-block-start: 1rem;
  color: #010101;
}
.estimate-document__table {
  width: 100%;
  font-size: 0.9375rem;
  border-collapse: collapse;
  color: #010101;
}
.estimate-document__table thead {
  color: #f1f5f9;
  background-color: #4a90e2;
}
.estimate-document__table th {
  font-weight: 600;
  text-align: left;
  border: #4a90e2 1px solid;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  color: #f1f5f9;
}
.estimate-document__tax-table th,
.estimate-document__tax-table td {
  text-align: center;
  border: #e0e0e0 1px solid;
  padding-block: 0.5rem;
  padding-inline: 0.5rem;
  color: #010101;
}
.estimate-document__tax-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #010101;
}
.estimate-document__table th:nth-child(2),
.estimate-document__table th:nth-child(3),
.estimate-document__table th:nth-child(4) {
  text-align: right;
}
.estimate-document__table td {
  border: #e0e0e0 1px solid;
  padding-block: 0.625rem;
  padding-inline: 1rem;
  color: #010101;
}
.estimate-document__category-row td {
  font-weight: 600;
  background-color: #f8f9fa;
  color: #010101;
}
.estimate-document__table td:nth-child(2),
.estimate-document__table td:nth-child(3),
.estimate-document__table td:nth-child(4) {
  text-align: right;
}
.estimate-document__summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-block-start: 2rem;
}
.estimate-document__tax-table table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}
.estimate-document__totals {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.estimate-document__totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  color: #010101;
}
.estimate-document__totals-row--urgent {
  border-left: #ff4f48 0.25rem solid;
  color: #010101;
}
.estimate-document__totals-row--final {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f1f5f9;
  background-color: #4a90e2;
  padding-block: 1rem;
  padding-inline: 1.25rem;
}
.estimate-document__totals-label {
  font-weight: 600;
}
.estimate-document__totals-value {
  font-weight: 700;
  letter-spacing: 0.05em;
}
.estimate-document__notes {
  border: #e0e0e0 1px solid;
  border-radius: 0.5rem;
  margin-block-start: 2rem;
  padding-block: 1.5rem;
  padding-inline: 1.5rem;
}
.estimate-document__notes-title {
  font-size: 1rem;
  font-weight: 700;
  color: #010101;
  margin-block-start: 1rem;
}
.estimate-document__notes-content {
  font-size: 0.875rem;
  line-height: 1.8;
  color: #010101;
}
.estimate-document__notes-content p {
  margin: 0;
  color: #010101;
}
.estimate-document__notes-content p:empty {
  margin-block: 0.5rem;
}
`;

/**
 * HTML要素からPDFを生成（html2pdf.js使用）
 * HTML要素をそのまま画像化してPDFに変換するため、デザインが完璧に再現されます
 * oncloneでスタイルを注入し、Firefox等で色が失われる問題を回避する
 */
export async function generateEstimatePDFFromHTML(
  element: HTMLElement,
  estimateNumber: string
): Promise<Blob> {
  // 動的インポートでhtml2pdf.jsを読み込み（ブラウザ環境のみ）
  const html2pdf = (await import('html2pdf.js')).default;

  return new Promise((resolve, reject) => {
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `estimate_${estimateNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f1f5f9',
        onclone: (clonedDoc: Document, _clonedElement: HTMLElement) => {
          // クローンされた文書にスタイルを注入（FirefoxのcssRules失敗を回避）
          const style = clonedDoc.createElement('style');
          style.textContent = ESTIMATE_DOCUMENT_PDF_STYLES;
          const head = clonedDoc.head ?? clonedDoc.documentElement;
          head.appendChild(style);
        },
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
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
