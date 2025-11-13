# グリッチ効果（Chromatic Aberration）実装提案

depthAppearアニメーション中に適用するグリッチ効果の実装方法を提案します。

## 手法1: 疑似要素によるRGBチャンネル分離（推奨）⭐

### メリット

- **パフォーマンス**: CSSのみで実装可能、GPU加速が効く
- **制御性**: アニメーション中に強度を調整可能
- **互換性**: モダンブラウザで広くサポート
- **実装の容易さ**: 比較的シンプル

### 実装方法

```css
.container::before,
.container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.5;
}

.container::before {
  background: inherit;
  transform: translateX(-2px);
  filter: blur(0.5px);
  mix-blend-mode: screen;
  background-image: inherit;
  background-size: inherit;
  background-position: inherit;
  clip-path: inset(0 0 0 0);
  /* 赤チャンネルを強調 */
  filter: blur(0.5px) contrast(1.2) saturate(1.5);
}

.container::after {
  background: inherit;
  transform: translateX(2px);
  filter: blur(0.5px);
  mix-blend-mode: screen;
  /* 青チャンネルを強調 */
  filter: blur(0.5px) contrast(1.2) saturate(1.5);
}
```

### より実用的な実装（画像を3層に分離）

```css
.image {
  position: relative;
}

.image::before,
.image::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: inherit;
  background-size: inherit;
  background-position: inherit;
  pointer-events: none;
  mix-blend-mode: screen;
}

.image::before {
  transform: translateX(-3px);
  filter: blur(0.5px) contrast(1.3);
  /* 赤チャンネル */
  mix-blend-mode: screen;
  opacity: 0.6;
}

.image::after {
  transform: translateX(3px);
  filter: blur(0.5px) contrast(1.3);
  /* 青チャンネル */
  mix-blend-mode: screen;
  opacity: 0.6;
}
```

---

## 手法2: CSS filter: drop-shadow（シンプル）

### メリット

- **シンプル**: 実装が簡単
- **軽量**: パフォーマンスが良い

### デメリット

- **制御性**: RGB分離の細かい制御が難しい
- **効果**: グリッチ感が弱い可能性

### 実装方法

```css
.image {
  filter: drop-shadow(3px 0 0 rgba(255, 0, 0, 0.5)) drop-shadow(-3px 0 0 rgba(0, 0, 255, 0.5))
    drop-shadow(0 2px 0 rgba(0, 255, 0, 0.3));
}
```

---

## 手法3: mix-blend-mode + 複数レイヤー

### メリット

- **視覚効果**: 強いグリッチ感
- **柔軟性**: 様々なブレンドモードを組み合わせ可能

### デメリット

- **複雑性**: 実装がやや複雑
- **パフォーマンス**: レイヤーが多いと重くなる可能性

### 実装方法

```css
.container {
  position: relative;
}

.image {
  position: relative;
  z-index: 1;
}

.glitch-red,
.glitch-blue {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: inherit;
  background-size: inherit;
  pointer-events: none;
  mix-blend-mode: screen;
}

.glitch-red {
  transform: translateX(-4px);
  filter: blur(1px) contrast(1.5);
  mix-blend-mode: screen;
  opacity: 0.7;
  z-index: 2;
}

.glitch-blue {
  transform: translateX(4px);
  filter: blur(1px) contrast(1.5);
  mix-blend-mode: screen;
  opacity: 0.7;
  z-index: 3;
}
```

---

## 手法4: SVG filter（高度）

### メリット

- **高品質**: 非常に滑らかなグリッチ効果
- **制御性**: 細かい調整が可能

### デメリット

- **複雑性**: 実装が複雑
- **パフォーマンス**: SVG filterはやや重い

### 実装方法

```html
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="glitch">
      <feOffset in="SourceGraphic" dx="-3" dy="0" result="red">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </feOffset>
      <feOffset in="SourceGraphic" dx="3" dy="0" result="blue">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  1 0 0 0 0  0 0 0 1 0" />
      </feOffset>
      <feComposite in="red" in2="blue" operator="screen" />
    </filter>
  </defs>
</svg>
```

```css
.image {
  filter: url(#glitch);
}
```

---

## 手法5: Canvas/WebGL（最も高度）

### メリット

- **最高品質**: 最もリアルなグリッチ効果
- **柔軟性**: あらゆる効果を実装可能

### デメリット

- **複雑性**: 実装が非常に複雑
- **パフォーマンス**: 重い可能性
- **オーバーキル**: 今回の用途には過剰

---

## 推奨実装: 手法1（疑似要素によるRGBチャンネル分離）

### 理由

1. **バランス**: 実装の容易さと効果のバランスが良い
2. **パフォーマンス**: CSSのみでGPU加速が効く
3. **アニメーション対応**: CSSアニメーションとGSAPの両方で制御可能
4. **カスタマイズ性**: 強度や方向を簡単に調整可能

### アニメーション中の適用方法

#### CSSアニメーションの場合

```css
@keyframes depthAppear {
  0% {
    opacity: 0;
    transform: scale(0.1) translateZ(-400px);
    filter: blur(4px);
    --glitch-offset: 0px;
  }
  30% {
    --glitch-offset: 5px; /* グリッチ効果を強く */
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05) translateZ(0);
    filter: blur(1px);
    --glitch-offset: 3px;
  }
  70% {
    --glitch-offset: 2px; /* グリッチ効果を弱く */
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
    filter: blur(0);
    --glitch-offset: 0px; /* グリッチ効果を消す */
  }
}
```

#### GSAPの場合

```javascript
timeline
  .to(element, {
    scale: 1.1,
    opacity: 0.6,
    duration: duration * 0.6,
    ease: "power2.out",
    // グリッチ効果を追加
    "--glitch-offset": "5px",
  })
  .to(element, {
    scale: 1,
    opacity: 1,
    duration: duration * 0.4,
    ease: "power2.inOut",
    // グリッチ効果を弱める
    "--glitch-offset": "0px",
  });
```

---

## 実装の優先順位

1. **手法1（疑似要素）** - 推奨 ⭐
2. **手法2（drop-shadow）** - シンプルな実装が必要な場合
3. **手法3（mix-blend-mode）** - より強い効果が必要な場合
4. **手法4（SVG filter）** - 最高品質が必要な場合
5. **手法5（Canvas）** - 今回は非推奨

---

## 次のステップ

どの手法で実装を進めますか？推奨は**手法1（疑似要素によるRGBチャンネル分離）**です。
