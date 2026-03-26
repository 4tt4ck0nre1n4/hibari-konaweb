import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { EstimateData } from "../types/pricing";
import { COMPANY_INFO } from "../config/companyInfo";
// PDF用スタイル（EstimateDocument.css の印刷用スタイルに相当、変数解決済み）
import estimateDocumentPdfStyles from "../styles/pricing/EstimateDocumentPDF.css?raw";

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
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // タイトル
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const titleText = "概算見積書";
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, currentY);
  currentY += 15;

  // 発行日・見積番号（左側）
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`発行日: ${estimateData.issueDate}`, 20, currentY);
  doc.text(`見積番号: ${estimateData.estimateNumber}`, 20, currentY + 7);
  doc.text(`有効期限: ${estimateData.expiryDate}`, 20, currentY + 14);

  // 会社情報（右側）
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, pageWidth - 20, currentY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.website, pageWidth - 20, currentY + 7, { align: "right" });

  const regNumber: string = COMPANY_INFO.registrationNumber;
  if (regNumber !== "" && regNumber.length > 0) {
    doc.text(`登録番号: ${regNumber}`, pageWidth - 20, currentY + 14, {
      align: "right",
    });
  }

  currentY += 25;

  // お客様名
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("〇〇〇〇〇〇 御中", 20, currentY);
  currentY += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("下記の通りお見積り申し上げます。", 20, currentY);
  currentY += 10;

  // 件名
  doc.text(`件名: ${estimateData.subject}`, 20, currentY);
  currentY += 10;

  // お見積金額
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const totalAmount = formatPrice(estimateData.calculation.total);
  doc.text(`お見積金額: ${totalAmount}円`, 20, currentY);
  currentY += 10;

  // 明細テーブル
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // 両プランの明細を結合（ホームページ制作 → コーディングの順）
  const allItems = [...estimateData.calculation.designItems, ...estimateData.calculation.codingItems];
  const tableData = allItems.map((item) => [
    item.name,
    `${formatPrice(item.unitPrice)}円`,
    item.quantity.toString(),
    `${formatPrice(item.totalPrice)}円`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["品名", "単価", "数量", "金額"]],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  // テーブルの終了位置を取得
  const finalY = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? currentY) + 50;
  currentY = finalY + 10;

  // 税別内訳テーブル
  autoTable(doc, {
    startY: currentY,
    head: [["税別内訳", "小計（税抜金額）", "小計（税のみ）"]],
    body: [
      [
        "10%対象分",
        `${formatPrice(estimateData.calculation.subtotal)}円`,
        `${formatPrice(estimateData.calculation.tax)}円`,
      ],
      ["8%対象分", "-", "-"],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 55, halign: "right" },
      2: { cellWidth: 55, halign: "right" },
    },
  });

  const taxTableFinalY = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? currentY) + 30;
  currentY = taxTableFinalY + 10;

  // 金額サマリー
  doc.setFontSize(10);
  const rightX = pageWidth - 20;

  doc.text(`小計（税抜）: ${formatPrice(estimateData.calculation.subtotal)}円`, rightX, currentY, {
    align: "right",
  });
  currentY += 7;

  if (estimateData.isUrgent && estimateData.calculation.urgentFee > 0) {
    doc.setTextColor(255, 0, 0);
    doc.text(`特急料金（20%）: ${formatPrice(estimateData.calculation.urgentFee)}円`, rightX, currentY, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
    currentY += 7;
  }

  doc.text(`消費税（10%）: ${formatPrice(estimateData.calculation.tax)}円`, rightX, currentY, {
    align: "right",
  });
  currentY += 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`合計（税込）: ${formatPrice(estimateData.calculation.total)}円`, rightX, currentY, {
    align: "right",
  });
  currentY += 10;

  // 備考
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("備考", 20, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  const notes = [
    "※ これは概算見積書です。実際の金額は詳細なヒアリング後に確定いたします。",
    "※ 価格は予告なく変更される場合があります。",
    "※ 本概算見積書の有効期限は発行日より30日間です。",
    "",
    "【別途費用が発生する項目】",
    "■ 素材・ライセンス費用",
    "有料画像素材、プレミアムフォント等のライセンス購入が必要な場合は、実費を別途請求させていただきます。",
    "",
    "■ 仕様変更・追加開発",
    "お見積り後に仕様変更や追加機能のご要望が生じた場合は、内容を確認の上、別途お見積りいたします。",
    "",
    "■ その他実費",
    "交通費、宿泊費等は含まれておりません。別途発生する場合は実費請求とさせていただきます。",
    "",
    "【お支払いについて】",
    "お振込手数料は貴社にてご負担願います。",
  ];

  notes.forEach((note) => {
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
export function downloadPDF(doc: jsPDF, filename: string = "estimate.pdf"): void {
  doc.save(filename);
}

/**
 * PDFをBlobとして取得
 */
export function getPDFBlob(doc: jsPDF): Blob {
  const blob = doc.output("blob");

  // ファイルサイズチェック（5MB制限）
  const MAX_PDF_SIZE = 5 * 1024 * 1024;
  if (blob.size > MAX_PDF_SIZE) {
    throw new Error("PDFファイルサイズが大きすぎます（最大5MB）");
  }

  return blob;
}

/**
 * PDFをBase64として取得（フォーム送信用）
 */
export function getPDFBase64(doc: jsPDF): string {
  return doc.output("dataurlstring");
}

/**
 * 見積データのバリデーション
 */
export function validateEstimateData(estimateData: EstimateData): boolean {
  // 必須フィールドのチェック
  if (
    estimateData.estimateNumber === "" ||
    estimateData.estimateNumber.length === 0 ||
    estimateData.issueDate === "" ||
    estimateData.issueDate.length === 0
  ) {
    console.error("見積番号または発行日が不足しています");
    return false;
  }

  // 金額の妥当性チェック
  if (estimateData.calculation.total < 0) {
    console.error("金額が不正です");
    return false;
  }

  // 項目数のチェック（コーディング・ホームページ制作のいずれかに項目があればOK）
  const totalItems = estimateData.calculation.codingItems.length + estimateData.calculation.designItems.length;
  if (totalItems === 0) {
    console.error("項目が選択されていません");
    return false;
  }

  return true;
}

/**
 * HTML要素からPDFを生成（html2canvas + 手動キャンバス分割 + jsPDF 方式）
 *
 * html2pdf.js の改ページ機構（before/css/legacy）はそれぞれ独立した余白挿入により
 * 2ページ目先頭の空白問題を引き起こすため、以下の方式に切り替えた：
 *
 * 1. html2canvas でページ全体を1枚のキャンバスに描画
 * 2. .estimate-document__page1 ラッパーの高さから分割位置を計算
 * 3. キャンバスを1ページ目スライスと2ページ目以降スライスに手動分割
 * 4. jsPDF.addImage() で各スライスをページとして書き出す
 */
export async function generateEstimatePDFFromHTML(element: HTMLElement, _estimateNumber: string): Promise<Blob> {
  // 動的インポート（ブラウザ環境のみ）
  const html2canvas = (await import("html2canvas")).default;

  // 分割位置：onclone 内（PDF CSS 適用済みのクローン DOM）で計測することで正確な値を得る
  // オリジナル DOM とクローン DOM では padding・font-size 等が異なるため、クローン側で計測する必要がある
  let canvasSplitY = 0;

  // キャンバスにフル描画（onclone でスタイル注入・クラス付与・details margin リセット・分割位置計測）
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#f1f5f9",
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      // PDF 専用スタイルを最後に注入し、画面用の EstimateDocument.css より優先させる
      const style = clonedDoc.createElement("style");
      style.setAttribute("data-estimate-pdf-styles", "true");
      style.textContent = estimateDocumentPdfStyles;
      const head = clonedDoc.head ?? clonedDoc.documentElement;
      head.appendChild(style);
      clonedElement.classList.add("estimate-document--pdf-export");
      // インラインスタイルで margin-block-start: 0 を直接適用し、CSS読み込み順に依存しないようにする
      const detailsEl = clonedElement.querySelector<HTMLElement>(".estimate-document__details");
      if (detailsEl) detailsEl.style.marginBlockStart = "0";

      // アコーディオン親の overflow を強制解除（CSS 注入タイミング差への安全策）
      // アコーディオンの展開自体は呼び出し元（handleDownloadPDF / handleContact）で
      // documentRef.current に対して直接 DOM 操作済みのため、ここでは overflow のみ修正する
      const accordionEls = clonedElement.querySelectorAll<HTMLElement>(
        ".estimate-document__notes-accordion",
      );
      accordionEls.forEach((el) => {
        el.style.overflow = "visible";
      });

      // PDF CSS が適用されたクローン DOM で page1 ラッパーの下端位置を計測
      // （オリジナル DOM より正確にキャンバス上の分割位置と一致する）
      const page1InClone = clonedElement.querySelector<HTMLElement>(".estimate-document__page1");
      if (page1InClone) {
        const clonedRect = clonedElement.getBoundingClientRect();
        const page1Rect = page1InClone.getBoundingClientRect();
        canvasSplitY = Math.round((page1Rect.bottom - clonedRect.top) * 2); // scale 2
      }
    },
  });

  // onclone での計測に失敗した場合のフォールバック
  if (canvasSplitY <= 0) {
    const page1El = element.querySelector<HTMLElement>(".estimate-document__page1");
    const page1HeightCssPx = page1El?.getBoundingClientRect().height ?? 0;
    const CANVAS_TOP_PAD_PX = Math.round((0.2 / 2.54) * 96 * 2); // 0.2cm @ 96dpi × scale2 ≈ 15px
    canvasSplitY = Math.round(page1HeightCssPx * 2) + CANVAS_TOP_PAD_PX;
  }
  canvasSplitY = Math.min(canvasSplitY, canvas.height);

  // PDF ページ寸法（mm）
  const MARGIN = { top: 4, right: 8, bottom: 10, left: 8 };
  const CONTENT_W_MM = 210 - MARGIN.left - MARGIN.right; // 194mm
  const CONTENT_H_MM = 297 - MARGIN.top - MARGIN.bottom; // 283mm

  // キャンバスの mm 換算スケール（canvas.width = 要素のCSS幅 × 2）
  const pxPerMm = canvas.width / CONTENT_W_MM;
  const pageHeightPx = Math.round(CONTENT_H_MM * pxPerMm);

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  /**
   * キャンバスの [startPx, endPx) 範囲を切り出して PDF ページとして追加する
   */
  const addSlice = (startPx: number, endPx: number, isFirstPage: boolean): void => {
    const sliceH = endPx - startPx;
    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = sliceH;
    offscreen.getContext("2d")?.drawImage(canvas, 0, startPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    if (!isFirstPage) doc.addPage();
    // 品質を 0.80 に下げてカラー SVG アイコン含む新デザインの JPEG サイズを抑制
    doc.addImage(
      offscreen.toDataURL("image/jpeg", 0.80),
      "JPEG",
      MARGIN.left,
      MARGIN.top,
      CONTENT_W_MM,
      sliceH / pxPerMm,
    );
  };

  // 1ページ目：ヘッダー〜お見積金額（canvas[0 → canvasSplitY]）
  addSlice(0, canvasSplitY, true);

  // 2ページ目以降：明細・合計・備考（canvas[canvasSplitY → 末尾] を A4 高さ単位で分割）
  let y = canvasSplitY;
  while (y < canvas.height) {
    addSlice(y, Math.min(y + pageHeightPx, canvas.height), false);
    y += pageHeightPx;
  }

  const blob = doc.output("blob");

  // ファイルサイズチェック（カラーSVGアイコン追加後の増加を考慮して 10MB に引き上げ）
  const MAX_PDF_SIZE = 10 * 1024 * 1024;
  if (blob.size > MAX_PDF_SIZE) {
    throw new Error(`PDFファイルサイズが大きすぎます（${(blob.size / 1024 / 1024).toFixed(1)}MB、最大10MB）`);
  }

  return blob;
}
