/**
 * Contact Form 7にPDFファイルを動的に添付
 * お問い合わせページで実行されるスクリプト
 */
export function attachPDFToContactForm(): void {
  const pdfData = sessionStorage.getItem('estimatePDF');
  const estimateNumber = sessionStorage.getItem('estimateNumber');

  if (!pdfData || !estimateNumber) {
    console.log('PDFデータがありません');
    return;
  }

  // Base64データをBlobに変換
  fetch(pdfData)
    .then((res) => res.blob())
    .then((blob) => {
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
          // 既存の通知を削除
          const existingNotice = container.querySelector('.estimate-attached-notice');
          if (existingNotice) {
            existingNotice.remove();
          }

          // 新しい通知を追加
          const notice = document.createElement('p');
          notice.className = 'estimate-attached-notice';
          notice.textContent = `✅ 見積書が添付されました: estimate_${estimateNumber}.pdf`;
          notice.style.color = '#28a745';
          notice.style.marginTop = '0.5rem';
          notice.style.fontSize = '0.9rem';
          notice.style.fontWeight = 'bold';
          container.appendChild(notice);
        }

        console.log('PDFファイルを添付しました:', file.name);
      } else {
        console.warn('ファイル入力フィールドが見つかりません');
      }

      // SessionStorageをクリア
      sessionStorage.removeItem('estimatePDF');
      sessionStorage.removeItem('estimateNumber');
    })
    .catch((error) => {
      console.error('PDFファイルの添付に失敗しました:', error);
      alert('見積書の添付に失敗しました。お手数ですが、再度お試しください。');
    });
}

/**
 * DOMContentLoaded時に自動実行
 */
if (typeof window !== 'undefined') {
  // Contact Form 7の準備完了を待つ
  document.addEventListener('DOMContentLoaded', () => {
    // CF7のフォームが読み込まれるまで少し待つ
    setTimeout(() => {
      attachPDFToContactForm();
    }, 500);
  });

  // CF7のフォームが動的に読み込まれる場合に対応
  document.addEventListener('wpcf7mailsent', () => {
    // 送信成功後の処理（必要に応じて）
    console.log('Contact Form 7: メール送信成功');
  });

  document.addEventListener('wpcf7invalid', () => {
    // バリデーションエラー時の処理
    console.log('Contact Form 7: バリデーションエラー');
  });

  document.addEventListener('wpcf7spam', () => {
    // スパム判定時の処理
    console.log('Contact Form 7: スパム判定');
  });

  document.addEventListener('wpcf7mailfailed', () => {
    // メール送信失敗時の処理
    console.log('Contact Form 7: メール送信失敗');
  });
}
