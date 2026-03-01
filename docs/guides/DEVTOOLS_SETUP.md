# Chrome DevTools 設定ガイド

## 背景画像の表示問題について

開発環境でFirstViewの背景画像が表示されない場合、Chrome DevTools の「Disable cache」機能が原因です。

### 問題の原因

- Chrome DevTools の「Disable cache」が**有効**だと、`<picture>` 要素が正しく動作しません
- これはChrome DevToolsの既知の制限です
- **実機（iPhone、Android、PC）では常に正常に動作します**

### 解決方法

1. Chrome DevTools を開く（F12キー）
2. **Network** タブを選択
3. **「Disable cache」のチェックを外す**
4. ページをリロード（Ctrl+R / Cmd+R）

これで背景画像が正常に表示されます。

### 注意事項

- CSS/JavaScriptの変更をテストする際は、一時的に「Disable cache」を有効にすることがあります
- その場合、背景画像でエラーが表示されますが、**実機では問題ありません**
- テスト完了後は「Disable cache」を無効に戻してください

### 参考

- Chromium Issue: Picture element and DevTools compatibility
- 本番環境のユーザーには一切影響しません

## その他のDevTools設定

### デバイスエミュレーション

iPad Pro (1024px) や iPad (768px) でテストする際：

1. DevTools を開く
2. デバイスツールバーを有効化（Ctrl+Shift+M / Cmd+Shift+M）
3. デバイスを選択
4. **「Disable cache」がOFFになっていることを確認**
5. ページをリロード

### トラブルシューティング

**Q: 背景画像が表示されない**
- A: Network タブで「Disable cache」のチェックを外してください

**Q: iPad Pro で画像がぼやける**
- A: デスクトップ用画像（1920x1080）が使用されているため正常です

**Q: iPhone 実機では表示されるのに DevTools で表示されない**
- A: 「Disable cache」をOFFにしてください。これは DevTools 固有の問題です

## 開発ワークフロー

### 推奨設定

開発時は以下の設定を推奨します：

1. **「Disable cache」: OFF**（通常時）
2. CSS/JS変更時のみ一時的にON
3. テスト完了後はOFFに戻す

### ビルド前の確認

デプロイ前に以下を確認してください：

1. ローカル環境で「Disable cache」をOFFにして確認
2. iPad Pro (1024px) で背景画像が表示されることを確認
3. iPad (768px) で背景画像が表示されることを確認
4. コンソールにエラーが出ていないことを確認
