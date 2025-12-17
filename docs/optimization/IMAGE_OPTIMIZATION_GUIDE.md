# 画像最適化ガイド

## 概要

このガイドでは、PageSpeed Insightsのスコアを改善するための画像最適化方法を説明します。

## 問題点

`.grid__menu`で使用されているSVGファイルが非常に大きい（最大489KB）ことが判明しました。これらのファイルには、base64エンコードされたPNG画像が埋め込まれています。

## 最適化方法

### 1. SVGファイルの最適化

SVGファイル内のbase64エンコードされたPNG画像を削除することで、99.3%のサイズ削減が可能です。

**注意**: base64エンコードされたPNG画像を削除すると、画像が表示されなくなる可能性があります。

### 2. 推奨される最適化アプローチ

1. **base64エンコードされたPNG画像を抽出**
   - SVGファイルからbase64エンコードされたPNG画像を抽出
   - 別のPNGファイルとして保存

2. **PNG画像をWebPに変換**
   - PNG画像をWebP形式に変換（約30-50%のサイズ削減）
   - AstroのImageコンポーネントが自動的に処理

3. **SVGファイルを最適化**
   - base64エンコードされたPNG画像への参照を削除
   - 不要な要素を削除

4. **GridSvgコンポーネントでWebP画像を使用**
   - SVGファイルの代わりにWebP画像を使用
   - または、SVGファイルとWebP画像を組み合わせて使用

### 3. 最適化スクリプトの使用方法

```bash
# SVGファイルを最適化
node scripts/optimize-svg.mjs
```

### 4. 最適化結果

- **合計元のサイズ**: 2,577.63 KB
- **合計最適化後**: 18.53 KB
- **合計削減**: 2,559.10 KB (99.3%)

## 次のステップ

1. base64エンコードされたPNG画像を抽出するスクリプトを作成
2. PNG画像をWebPに変換
3. GridSvgコンポーネントを更新してWebP画像を使用

## 参考資料

- [Astro Image Optimization](https://docs.astro.build/en/guides/images/)
- [SVGO Documentation](https://github.com/svg/svgo)
- [WebP Format](https://developers.google.com/speed/webp)
