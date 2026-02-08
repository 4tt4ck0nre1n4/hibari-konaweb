import { useRef } from 'react';
import type { EstimateData } from '../types/pricing';
import { COMPANY_INFO } from '../config/companyInfo';
import { generateEstimatePDFFromHTML } from '../utils/generatePDF';
import '../styles/pricing/EstimateDocument.css';

interface EstimateDocumentProps {
  estimateData: EstimateData;
}

export function EstimateDocument({ estimateData }: EstimateDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
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

        // お問い合わせページへ遷移
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
      <div className="estimate-document__header">
        <h1 className="estimate-document__title">概算見積書</h1>
      </div>

      <div className="estimate-document__main">
        <div>
          <div className="estimate-document__client-name">〇〇〇〇〇〇 御中</div>
          <div className="estimate-document__greeting">
            下記の通りお見積り申し上げます。
          </div>
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
          {COMPANY_INFO.registrationNumber !== '' && (
            <div className="estimate-document__info-row">
              <span className="estimate-document__info-label">登録番号：</span>
              <span>{COMPANY_INFO.registrationNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="estimate-document__company">
        <div className="estimate-document__logo">
          <img
            src="/logo_myPortfolioSite-name.svg"
            alt={COMPANY_INFO.name}
            className="estimate-document__logo-icon"
          />
          <img
            src="/logo_text.svg"
            alt={COMPANY_INFO.name}
            className="estimate-document__logo-text"
          />
        </div>
        <div className="estimate-document__website">
          {COMPANY_INFO.website}
        </div>
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
        <span className="estimate-document__total-value">
          {formatPrice(estimateData.calculation.total)}円
        </span>
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
            <tr>
              <td colSpan={4}>コーディング料金</td>
            </tr>
            {estimateData.calculation.items.map((item) => (
              <tr key={item.itemId}>
                <td>{item.name}</td>
                <td>{formatPrice(item.unitPrice)}円</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.totalPrice)}円</td>
              </tr>
            ))}
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
            <span className="estimate-document__totals-value">
              {formatPrice(estimateData.calculation.subtotal)}円
            </span>
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
            <span className="estimate-document__totals-value">
              {formatPrice(estimateData.calculation.tax)}円
            </span>
          </div>
          <div className="estimate-document__totals-row estimate-document__totals-row--final">
            <span className="estimate-document__totals-label">合計（税込）</span>
            <span className="estimate-document__totals-value">
              {formatPrice(estimateData.calculation.total)}円
            </span>
          </div>
        </div>
      </div>

      <div className="estimate-document__notes">
        <h3 className="estimate-document__notes-title">備考</h3>
        <div className="estimate-document__notes-content">
          <p>※ これは概算見積書です。実際の金額は詳細なヒアリング後に確定いたします。</p>
          <p>※ 価格は予告なく変更される場合があります。</p>
          <p>※ 本概算見積書の有効期限は発行日より30日間です。</p>
          <p></p>
          <p>【別途費用が発生する項目】</p>
          <p>■ 素材・ライセンス費用</p>
          <p>有料画像素材、プレミアムフォント等のライセンス購入が必要な場合は、実費を別途請求させていただきます。</p>
          <p></p>
          <p>■ 仕様変更・追加開発</p>
          <p>お見積り後に仕様変更や追加機能のご要望が生じた場合は、内容を確認の上、別途お見積りいたします。</p>
          <p></p>
          <p>■ その他実費</p>
          <p>交通費、宿泊費等は含まれておりません。別途発生する場合は実費請求とさせていただきます。</p>
          <p></p>
          <p>【お支払いについて】</p>
          <p>お振込手数料は貴社にてご負担願います。</p>
        </div>
      </div>

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
          onClick={() => void handleDownloadPDF()}
        >
          PDFダウンロード
        </button>
        <button
          type="button"
          className="estimate-document__button estimate-document__button--contact"
          onClick={() => void handleContact()}
        >
          お問い合わせ
        </button>
      </div>
    </div>
  );
}
