import { useEffect, useRef, useState } from "react";
import type { EstimateData } from "@/types/pricing";
import { COMPANY_INFO } from "@/config/site";
import { generateEstimatePDFFromHTML } from "@/pricing/generatePDF";
import "@/styles/pricing/EstimateDocument.css";
import IconifyInline from "@/components/ui/IconifyInline";

const pdfIcon = "vscode-icons:file-type-pdf2";
const contactIcon = "ic:baseline-contact-mail";
const printerIcon = "fxemoji:printer";
const alarmClockIcon = "emojione-v1:alarm-clock";
const lightBulbIcon = "emojione:light-bulb";
const warningIcon = "emojione:warning";
const creditCardIcon = "fluent-emoji-flat:credit-card";
const cashPaymentIcon = "streamline-ultimate-color:cash-payment-sign-2";

/** "2026年04月24日" 形式の文字列から今日までの残り日数を算出する */
function computeRemainingDays(expiryDateStr: string): number {
  const match = expiryDateStr.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (!match) return 30;
  const expiry = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Firefox検証用: true にするとロゴ部分を非表示にする
 * ロゴをコメントアウトした状態でFirefoxから送信・ダウンロードして
 * 他要素が表示されるか確認し、SVGが原因か特定する
 */
const HIDE_LOGO_FOR_FIREFOX_TEST = false;

interface EstimateDocumentProps {
  estimateData: EstimateData;
}

export function EstimateDocument({ estimateData }: EstimateDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  type AccordionKey = "extraCosts" | "aboutEstimate" | "payment";
  const [openAccordions, setOpenAccordions] = useState<Record<AccordionKey, boolean>>({
    extraCosts: false,
    aboutEstimate: false,
    payment: false,
  });

  useEffect(() => {
    const el = documentRef.current;
    if (!el) return;
    (Object.keys(openAccordions) as AccordionKey[]).forEach((key) => {
      const btn = el.querySelector<HTMLButtonElement>(`button[data-accordion-key="${key}"]`);
      if (!btn) return;
      btn.setAttribute("aria-expanded", openAccordions[key] ? "true" : "false");
    });
  }, [openAccordions]);

  const toggleAccordion = (key: AccordionKey) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`;
  };

  /**
   * PDF/印刷キャプチャ前にアコーディオンを全展開し、元の状態を復元するクリーンアップ関数を返す。
   * React state を経由せず直接 DOM を操作することで、再レンダリング待ちなしに即座に反映できる。
   */
  const expandAccordionsForCapture = (): { restoreAccordions: () => void } => {
    const el = documentRef.current;
    if (!el) return { restoreAccordions: () => {} };

    const accordionEls = el.querySelectorAll<HTMLElement>(".estimate-document__notes-accordion");
    const contentEls = el.querySelectorAll<HTMLElement>(".estimate-document__notes-accordion__content");

    // 元の状態を保存
    const savedParentOverflow = Array.from(accordionEls).map((a) => a.style.overflow);
    const savedOpenAttrs = Array.from(accordionEls).map((a) => a.getAttribute("data-open"));
    const savedContentDisplay = Array.from(contentEls).map((c) => c.style.display);

    // 全展開
    accordionEls.forEach((a) => {
      a.setAttribute("data-open", "true");
      a.style.overflow = "visible";
    });
    contentEls.forEach((c) => {
      c.style.display = "block";
    });

    // color-mix() 使用要素の rgba() 置換（html2canvas が color-mix() 未対応のため）
    const colorMixSelectors = [
      ".estimate-document__notes-pill-title",
      ".estimate-document__notes-accordion__arrow",
      ".estimate-document__notes-footer",
    ];

    const colorMixEls = colorMixSelectors.flatMap((sel) => Array.from(el.querySelectorAll<HTMLElement>(sel)));

    const savedColors = colorMixEls.map((e) => e.style.color);

    colorMixEls.forEach((e) => {
      if (e.classList.contains("estimate-document__notes-pill-title")) {
        e.style.color = "rgba(1, 1, 1, 0.55)"; // #010101 55%
      } else if (e.classList.contains("estimate-document__notes-accordion__arrow")) {
        e.style.color = "rgba(1, 1, 1, 0.40)"; // #010101 40%
      } else if (e.classList.contains("estimate-document__notes-footer")) {
        e.style.color = "rgba(1, 1, 1, 0.55)"; // #010101 55%
      }
    });

    return {
      restoreAccordions: () => {
        accordionEls.forEach((a, i) => {
          a.setAttribute("data-open", savedOpenAttrs[i] ?? "false");
          a.style.overflow = savedParentOverflow[i] ?? "";
        });
        contentEls.forEach((c, i) => {
          c.style.display = savedContentDisplay[i] ?? "";
        });

        // color-mix() 要素の色を復元
        colorMixEls.forEach((e, i) => {
          e.style.color = savedColors[i] ?? "";
        });
      },
    };
  };

  const handlePrint = () => {
    const { restoreAccordions } = expandAccordionsForCapture();
    window.print();
    restoreAccordions();
  };

  const handleDownloadPDF = async () => {
    const { restoreAccordions } = expandAccordionsForCapture();
    try {
      if (!documentRef.current) {
        alert("見積書要素が見つかりません。");
        return;
      }

      // フォント読み込み完了を待つ（Firefox等でのテキスト描画を安定化）
      if (typeof document !== "undefined" && "fonts" in document) {
        await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 2000))]);
      }

      // ボタンを一時的に非表示
      const buttons = documentRef.current.querySelector(".estimate-document__actions");
      if (buttons) {
        (buttons as HTMLElement).style.display = "none";
      }

      // PDF生成
      const blob = await generateEstimatePDFFromHTML(documentRef.current, estimateData.estimateNumber);

      // ボタンを再表示
      if (buttons) {
        (buttons as HTMLElement).style.display = "";
      }

      // ダウンロード
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimate_${estimateData.estimateNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      alert(`PDFの生成に失敗しました。\n\n詳細: ${errorMessage}`);
    } finally {
      restoreAccordions();
    }
  };

  const handleContact = async () => {
    const { restoreAccordions } = expandAccordionsForCapture();
    try {
      if (!documentRef.current) {
        alert("見積書要素が見つかりません。");
        return;
      }

      // フォント読み込み完了を待つ（Firefox等でのテキスト描画を安定化）
      if (typeof document !== "undefined" && "fonts" in document) {
        await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 2000))]);
      }

      // ボタンを一時的に非表示
      const buttons = documentRef.current.querySelector(".estimate-document__actions");
      if (buttons) {
        (buttons as HTMLElement).style.display = "none";
      }

      // PDF生成
      const blob = await generateEstimatePDFFromHTML(documentRef.current, estimateData.estimateNumber);

      // ボタンを再表示
      if (buttons) {
        (buttons as HTMLElement).style.display = "";
      }

      // BlobをBase64に変換してSessionStorageに保存
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem("estimatePDF", base64data);
        sessionStorage.setItem("estimateNumber", estimateData.estimateNumber);

        // お問い合わせページへ遷移
        window.location.href = "/contact";
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      alert(`PDFの生成に失敗しました。\n\n詳細: ${errorMessage}`);
    } finally {
      restoreAccordions();
    }
  };

  const remainingDays = computeRemainingDays(estimateData.expiryDate);

  // IconifyInlineを使用してアイコンを表示（外部APIリクエストを完全に排除）
  const renderIcon = (iconName: string, className?: string, size = "32") => {
    const iconClassName = className ?? "estimate-document__icon";
    // IconifyInline はデフォルトで aria-hidden を付与するため、ここでは指定しない
    return <IconifyInline icon={iconName} width={size} height={size} className={iconClassName} />;
  };

  return (
    <div className="estimate-document" ref={documentRef}>
      {/* PDF出力時に break-after: page でここまでを1ページ目にする */}
      <div className="estimate-document__page1">
        <div className="estimate-document__header">
          <h1 className="estimate-document__title">概算見積書</h1>
        </div>

        <div className="estimate-document__main">
          <div>
            <div className="estimate-document__client-name">〇〇〇〇〇〇 御中</div>
            <div className="estimate-document__greeting">下記の通りお見積り申し上げます。</div>
          </div>
          <div className="estimate-document__info">
            <div className="estimate-document__info-row">
              <span className="estimate-document__info-label">発行日：</span>
              <span>{estimateData.issueDate}</span>
            </div>
            <div className="estimate-document__info-row">
              <span className="estimate-document__info-label">見積番号：</span>
              <span>{estimateData.estimateNumber}</span>
            </div>
            {COMPANY_INFO.registrationNumber !== "" && (
              <div className="estimate-document__info-row">
                <span className="estimate-document__info-label">登録番号：</span>
                <span>{COMPANY_INFO.registrationNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="estimate-document__company">
          <div className="estimate-document__logo">
            {!HIDE_LOGO_FOR_FIREFOX_TEST ? (
              <>
                <img
                  src="/logo_myPortfolioSite-name.svg"
                  alt={COMPANY_INFO.name}
                  className="estimate-document__logo-icon"
                  width={32}
                  height={32}
                />
                <img
                  src="/logo_text.svg"
                  alt={COMPANY_INFO.name}
                  className="estimate-document__logo-text"
                  width={200}
                  height={24}
                />
              </>
            ) : /* Firefox検証用: ロゴ非表示で他要素の表示を確認 */
            null}
          </div>
          <div className="estimate-document__website">{COMPANY_INFO.website}</div>
        </div>

        <div className="estimate-document__subject-section">
          <div className="estimate-document__subject-row">
            <span className="estimate-document__subject-label">件名</span>
            <span>{estimateData.subject}</span>
          </div>
          <div className="estimate-document__subject-row">
            <span className="estimate-document__subject-label">有効期限</span>
            <span>：{estimateData.expiryDate}（発行日より30日間）</span>
          </div>
        </div>

        <div className="estimate-document__total-amount">
          <span className="estimate-document__total-label">お見積金額</span>
          <span className="estimate-document__total-value">{formatPrice(estimateData.calculation.total)}円</span>
        </div>
      </div>

      <div className="estimate-document__details">
        <h2 className="estimate-document__details-title">【明細】</h2>
        <table className="estimate-document__table">
          <thead>
            <tr>
              <th>品名</th>
              <th>単価</th>
              <th>数量</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            {/* パターン(a): ホームページ制作のみ */}
            {estimateData.hasDesignItems && !estimateData.hasCodingItems && (
              <>
                <tr>
                  <td colSpan={4}>ホームページ制作料金</td>
                </tr>
                {estimateData.calculation.designItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.name}</td>
                    <td>{formatPrice(item.unitPrice)}円</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.totalPrice)}円</td>
                  </tr>
                ))}
              </>
            )}

            {/* パターン(b): コーディングのみ */}
            {estimateData.hasCodingItems && !estimateData.hasDesignItems && (
              <>
                <tr>
                  <td colSpan={4}>コーディング料金</td>
                </tr>
                {estimateData.calculation.codingItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.name}</td>
                    <td>{formatPrice(item.unitPrice)}円</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.totalPrice)}円</td>
                  </tr>
                ))}
              </>
            )}

            {/* パターン(c): 両方 */}
            {estimateData.hasDesignItems && estimateData.hasCodingItems && (
              <>
                <tr>
                  <td colSpan={4}>ホームページ制作料金</td>
                </tr>
                <tr>
                  <td colSpan={4}>ホームページ制作</td>
                </tr>
                {estimateData.calculation.designItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.name}</td>
                    <td>{formatPrice(item.unitPrice)}円</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.totalPrice)}円</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4}>コーディング</td>
                </tr>
                {estimateData.calculation.codingItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.name}</td>
                    <td>{formatPrice(item.unitPrice)}円</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.totalPrice)}円</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="estimate-document__summary">
        <div className="estimate-document__tax-breakdown">
          <table className="estimate-document__tax-table">
            <thead>
              <tr>
                <th>税別内訳</th>
                <th>小計（税抜金額）</th>
                <th>小計（税のみ）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%対象分</td>
                <td>{formatPrice(estimateData.calculation.subtotal)}円</td>
                <td>{formatPrice(estimateData.calculation.tax)}円</td>
              </tr>
              <tr>
                <td>8%対象分</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="estimate-document__totals">
          <div className="estimate-document__totals-row">
            <span className="estimate-document__totals-label">小計（税抜）</span>
            <span className="estimate-document__totals-value">{formatPrice(estimateData.calculation.subtotal)}円</span>
          </div>
          {estimateData.isUrgent && estimateData.calculation.urgentFee > 0 && (
            <div className="estimate-document__totals-row estimate-document__totals-row--urgent">
              <span className="estimate-document__totals-label">特急料金（20%）</span>
              <span className="estimate-document__totals-value">
                {formatPrice(estimateData.calculation.urgentFee)}円
              </span>
            </div>
          )}
          <div className="estimate-document__totals-row">
            <span className="estimate-document__totals-label">消費税</span>
            <span className="estimate-document__totals-value">{formatPrice(estimateData.calculation.tax)}円</span>
          </div>
          <div className="estimate-document__totals-row estimate-document__totals-row--final">
            <span className="estimate-document__totals-label">合計（税込）</span>
            <span className="estimate-document__totals-value">{formatPrice(estimateData.calculation.total)}円</span>
          </div>
        </div>
      </div>

      <div className="estimate-document__notes">
        {/* サマリーピル（3点） */}
        <div className="estimate-document__notes-pills">
          <div className="estimate-document__notes-pill">
            {renderIcon(alarmClockIcon, "estimate-document__notes-pill-icon", "32")}
            <span className="estimate-document__notes-pill-title">有効期限</span>
            <span className="estimate-document__notes-pill-value">30日間</span>
          </div>
          <div className="estimate-document__notes-pill">
            {renderIcon(creditCardIcon, "estimate-document__notes-pill-icon", "32")}
            <span className="estimate-document__notes-pill-title">お支払い</span>
            <span className="estimate-document__notes-pill-value">振込手数料はご負担</span>
          </div>
          <div className="estimate-document__notes-pill">
            {renderIcon(cashPaymentIcon, "estimate-document__notes-pill-icon", "32")}
            <span className="estimate-document__notes-pill-title">この金額は</span>
            <span className="estimate-document__notes-pill-value">概算・税込表示</span>
          </div>
        </div>

        {/* アコーディオンリスト */}
        <div className="estimate-document__notes-accordions">
          {/* 別途費用 */}
          <div className="estimate-document__notes-accordion" data-open={openAccordions.extraCosts ? "true" : "false"}>
            <button
              type="button"
              className="estimate-document__notes-accordion__header"
              aria-expanded="false"
              data-accordion-key="extraCosts"
              onClick={() => toggleAccordion("extraCosts")}
            >
              {renderIcon(warningIcon, "estimate-document__notes-accordion__icon", "20")}
              <span className="estimate-document__notes-accordion__title">別途費用が発生する場合があります</span>
              <span className="estimate-document__notes-badge">3項目</span>
              <span className="estimate-document__notes-accordion__arrow" aria-hidden="true">
                ▼
              </span>
            </button>
            <div className="estimate-document__notes-accordion__content">
              <ul className="estimate-document__notes-accordion__list">
                <li>
                  <strong>素材・ライセンス費用</strong> —
                  有料画像・フォント等のライセンスが必要な場合は実費を別途請求します
                </li>
                <li>
                  <strong>仕様変更・追加機能</strong> — お見積り後の変更・追加は内容確認のうえ別途お見積りします
                </li>
                <li>
                  <strong>その他実費</strong> — 交通費・宿泊費等は含まれておりません
                </li>
              </ul>
            </div>
          </div>

          {/* この概算見積りについて */}
          <div
            className="estimate-document__notes-accordion"
            data-open={openAccordions.aboutEstimate ? "true" : "false"}
          >
            <button
              type="button"
              className="estimate-document__notes-accordion__header"
              aria-expanded="false"
              data-accordion-key="aboutEstimate"
              onClick={() => toggleAccordion("aboutEstimate")}
            >
              {renderIcon(cashPaymentIcon, "estimate-document__notes-accordion__icon", "20")}
              <span className="estimate-document__notes-accordion__title">この概算見積りについて</span>
              <span className="estimate-document__notes-badge">3項目</span>
              <span className="estimate-document__notes-accordion__arrow" aria-hidden="true">
                ▼
              </span>
            </button>
            <div className="estimate-document__notes-accordion__content">
              <ul className="estimate-document__notes-accordion__list">
                <li>実際の金額は詳細なヒアリング後に確定します</li>
                <li>価格は予告なく変更される場合があります</li>
                <li>有効期限は発行日より30日間です</li>
              </ul>
            </div>
          </div>

          {/* お支払いについて */}
          <div className="estimate-document__notes-accordion" data-open={openAccordions.payment ? "true" : "false"}>
            <button
              type="button"
              className="estimate-document__notes-accordion__header"
              aria-expanded="false"
              data-accordion-key="payment"
              onClick={() => toggleAccordion("payment")}
            >
              {renderIcon(creditCardIcon, "estimate-document__notes-accordion__icon", "20")}
              <span className="estimate-document__notes-accordion__title">お支払いについて</span>
              <span className="estimate-document__notes-badge">2項目</span>
              <span className="estimate-document__notes-accordion__arrow" aria-hidden="true">
                ▼
              </span>
            </button>
            <div className="estimate-document__notes-accordion__content">
              <ul className="estimate-document__notes-accordion__list">
                <li>お振込手数料はお客様にてご負担ください</li>
                <li>お支払い方法の詳細は正式見積り時にご案内します</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッターテキスト */}
        <p className="estimate-document__notes-footer">
          詳細な仕様やご不明点は{" "}
          <a href="/contact" className="estimate-document__notes-footer-link">
            お問い合わせ
          </a>{" "}
          よりお気軽にご相談ください
        </p>
      </div>

      <div className="estimate-document__actions no-print">
        {/* 有効期限バッジ */}
        <div className="estimate-document__expiry-badge">
          {renderIcon(alarmClockIcon, "estimate-document__icon--expiry", "20")}
          この見積りの有効期限：{estimateData.expiryDate}まで（残り{remainingDays}日）
        </div>

        {/* 次のステップ案内 */}
        <div className="estimate-document__next-step">
          {renderIcon(lightBulbIcon, "estimate-document__icon--next-step", "24")}
          <div>
            <strong>次のステップ：正式なご依頼はお問い合わせから</strong>
            <p className="estimate-document__next-step__desc">
              この概算をベースに仕様のすり合わせを行い、正式見積りをご案内します。
            </p>
          </div>
        </div>

        {/* CTAカード */}
        <div className="estimate-document__cta-card">
          <p className="estimate-document__cta-heading">この金額でご依頼を検討中ですか？</p>
          <p className="estimate-document__cta-sub">お気軽にご連絡ください。仕様の確認から対応します。</p>
          <button
            type="button"
            className="estimate-document__button estimate-document__button--contact"
            onClick={() => void handleContact()}
          >
            {renderIcon(contactIcon, "estimate-document__icon--contact")}
            お問い合わせ・正式見積りを依頼する →
          </button>
          <p className="estimate-document__cta-assurance">
            <span>✓ 返信は通常24時間以内</span>
            <span>✓ 相談・質問も歓迎</span>
          </p>
        </div>

        {/* サブアクション（印刷・PDF） */}
        <div className="estimate-document__secondary-buttons">
          <button
            type="button"
            className="estimate-document__button estimate-document__button--print"
            onClick={handlePrint}
          >
            {renderIcon(printerIcon, "estimate-document__icon--print")}
            印刷する
          </button>
          <button
            type="button"
            className="estimate-document__button estimate-document__button--pdf"
            onClick={() => void handleDownloadPDF()}
          >
            {renderIcon(pdfIcon, "estimate-document__icon--pdf")}
            PDFを保存
          </button>
        </div>
      </div>
    </div>
  );
}
