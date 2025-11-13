import { useEffect, useRef } from "react";
import depthAppearStyles from "../styles/depthAppearStyles.module.css";

type DepthAppearImageProps = {
  src: string;
  alt?: string;
  className?: string;
  duration?: number;
  delay?: number;
  useGSAP?: boolean;
  onAnimationComplete?: () => void;
};

/**
 * 画面奥から出現するアニメーション付き画像コンポーネント
 *
 * @param src - 画像のパス
 * @param alt - 画像の代替テキスト
 * @param className - 追加のCSSクラス
 * @param duration - アニメーションの継続時間（秒）
 * @param delay - アニメーション開始の遅延時間（秒）
 * @param useGSAP - GSAPを使用するかどうか（デフォルト: false、CSSアニメーションを使用）
 * @param onAnimationComplete - アニメーション完了時のコールバック
 */
export default function DepthAppearImage({
  src,
  alt = "Animated image",
  className = "",
  duration = 1.8,
  delay = 0.5,
  useGSAP = true,
  onAnimationComplete,
}: DepthAppearImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glitchRedRef = useRef<HTMLImageElement>(null);
  const glitchBlueRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!useGSAP) {
      // CSSアニメーションを使用する場合
      // ローディングスクリーンが消えるまで待機してからアニメーションを開始
      const startAnimation = () => {
        if (containerRef.current) {
          const container = containerRef.current;
          // 初期状態を設定（非表示）
          container.style.opacity = "0";
          container.style.transform = "scale(0.1)";
          container.style.visibility = "hidden";

          // ローディングスクリーンが消えたことを確認
          const checkLoadingScreen = () => {
            if (typeof document === "undefined" || typeof window === "undefined") return;
            const loadingScreen = document.getElementById("loading-screen");
            if (!loadingScreen) {
              // ローディングスクリーンが存在しない場合は即座にアニメーション開始
              container.style.visibility = "visible";
              container.style.animation = "none";
              requestAnimationFrame(() => {
                container.style.animation = "";
              });
              return;
            }

            const computedStyle = window.getComputedStyle(loadingScreen);
            const isVisible =
              loadingScreen.style.display !== "none" &&
              loadingScreen.style.visibility !== "hidden" &&
              computedStyle.display !== "none" &&
              computedStyle.visibility !== "hidden";

            if (isVisible) {
              // まだローディング中なので、少し待って再確認
              setTimeout(checkLoadingScreen, 100);
              return;
            }

            // ローディングが終了したらアニメーションを開始
            container.style.visibility = "visible";
            // CSSアニメーションを強制的に再開
            container.style.animation = "none";
            requestAnimationFrame(() => {
              container.style.animation = "";
            });
          };

          // 少し遅延させてからチェック開始（DOMが完全に読み込まれるのを待つ）
          setTimeout(checkLoadingScreen, 500);
        }
      };

      // DOMが準備できたら開始（ブラウザ環境でのみ実行）
      if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", startAnimation);
        } else {
          startAnimation();
        }
      } else {
        // SSR時は即座に開始
        startAnimation();
      }
      return;
    }

    // GSAPを使用する場合
    // ローディングスクリーンが消えるまで待機してからアニメーションを開始
    const startGSAPAnimation = () => {
      const initGSAPAnimation = async () => {
        try {
          const { gsap } = await import("gsap");
          const element = imageRef.current || containerRef.current;

          if (!element) return;

          // 初期状態：画面奥（小さく、透明、非表示、頭を奥に傾ける）
          gsap.set(element, {
            scale: 0.07,
            opacity: 0.2,
            transformOrigin: "50% 50%", // 中央を基準点に設定（上から降りてくる動きを避ける）
            rotationX: -30, // 頭を奥に傾ける（負の値で奥に）
            y: 0, // Y軸方向の移動を0に設定（上から降りてくる動きを避ける）
            visibility: "hidden",
            force3D: true, // 3D変換を強制
          });

          // グリッチレイヤーの初期状態
          const glitchLayers = [glitchRedRef.current, glitchBlueRef.current].filter(Boolean) as HTMLElement[];
          if (glitchLayers.length === 2) {
            // デバッグ用：グリッチレイヤーが正しく取得できているか確認
            console.log("Glitch layers found:", {
              red: glitchRedRef.current,
              blue: glitchBlueRef.current,
              count: glitchLayers.length,
            });

            // メイン画像の位置を計算してグリッチレイヤーを同じ位置に配置
            const updateGlitchPosition = () => {
              const mainImage = imageRef.current;
              if (mainImage && typeof window !== "undefined") {
                const rect = mainImage.getBoundingClientRect();
                glitchLayers.forEach((layer) => {
                  layer.style.position = "fixed";
                  layer.style.top = `${rect.top}px`;
                  layer.style.left = `${rect.left}px`;
                  layer.style.width = `${rect.width}px`;
                  layer.style.height = `${rect.height}px`;
                });
              }
            };

            // 初期位置を設定
            updateGlitchPosition();

            // リサイズ時やスクロール時に位置を更新（requestAnimationFrameで最適化）
            let rafId: number | null = null;
            const scheduleUpdate = () => {
              if (rafId !== null) return;
              rafId = requestAnimationFrame(() => {
                updateGlitchPosition();
                rafId = null;
              });
            };

            if (typeof window !== "undefined") {
              window.addEventListener("resize", scheduleUpdate);
              window.addEventListener("scroll", scheduleUpdate, { passive: true });
            }

            // 初期状態を直接スタイルで設定（GSAPの前に確実に設定）
            glitchLayers.forEach((layer) => {
              layer.style.setProperty("opacity", "0", "important");
              layer.style.transform = "translateX(0)";
              layer.style.visibility = "visible";
            });
            gsap.set(glitchLayers, {
              opacity: 0,
              x: 0,
              visibility: "visible",
              force3D: true, // 3D変換を強制
              // clearPropsは削除（opacityがクリアされるのを防ぐ）
            });
          } else {
            console.warn("Glitch layers not found or incomplete:", {
              red: glitchRedRef.current,
              blue: glitchBlueRef.current,
              count: glitchLayers.length,
            });
          }

          // ローディングスクリーンが消えたことを確認
          const checkLoadingScreen = () => {
            if (typeof document === "undefined") return;
            const loadingScreen = document.getElementById("loading-screen");
            if (!loadingScreen) {
              // ローディングスクリーンが存在しない場合は即座にアニメーション開始
              gsap.set(element, { visibility: "visible" });
              const timeline = gsap.timeline({
                delay,
                onComplete: onAnimationComplete,
              });

              // 途中状態: scale: 1.15, opacity: 0.6（頭を少し奥に傾ける）
              timeline.to(element, {
                scale: 1.1,
                opacity: 0.5,
                rotationX: -45, // 頭を少し奥に傾ける
                transformOrigin: "100% 100%", // 中央を基準点に維持（上から降りてくる動きを避ける）
                y: 0, // Y軸方向の移動を0に維持
                force3D: true, // 3D変換を強制
                duration: duration * 0.6,
                ease: "power2.inOut",
              });

              // グリッチ効果を強く（途中状態）- 要素が存在する場合のみ
              if (glitchLayers.length === 2) {
                timeline.to(
                  glitchLayers,
                  {
                    opacity: 0.9, // より強い効果のため少し下げる
                    x: (index) => (index === 0 ? -30 : 30), // オフセットを大きく
                    force3D: true, // 3D変換を強制
                    duration: duration * 0.3,
                    ease: "power2.inOut",
                    onStart: function (this: gsap.core.Tween) {
                      console.log("Glitch animation started (no loading screen)", {
                        targets: this.targets(),
                        count: this.targets().length,
                      });
                    },
                    onUpdate: function (this: gsap.core.Tween) {
                      // 確実にopacityを適用するため、直接スタイルを設定
                      const targets = this.targets();
                      const progress = this.progress();
                      const opacityValue = progress * 0.9;
                      targets.forEach((target, index) => {
                        const element = target as HTMLElement;
                        if (element) {
                          element.style.opacity = String(opacityValue);
                          // デバッグ用（最初の数回のみログ出力）
                          if (progress < 0.1 && index === 0) {
                            console.log("Glitch onUpdate:", {
                              progress,
                              opacityValue,
                              styleOpacity: element.style.opacity,
                              computedOpacity: window.getComputedStyle(element).opacity,
                            });
                          }
                        }
                      });
                    },
                  },
                  "<"
                );
              }

              // 終了状態: scale: 1, opacity: 1（正面を向く）
              timeline.to(element, {
                scale: 1,
                opacity: 1,
                rotationX: 0, // 正面を向く
                transformOrigin: "50% 50%", // 中央を基準点に維持（上から降りてくる動きを避ける）
                y: 0, // Y軸方向の移動を0に維持
                force3D: true, // 3D変換を強制
                duration: duration * 0.4,
                ease: "power2.inOut",
              });

              // グリッチ効果を弱める（終了状態）
              if (glitchLayers.length === 2) {
                timeline.to(
                  glitchLayers,
                  {
                    opacity: 0,
                    x: 0, // 位置をリセット
                    duration: duration * 0.4,
                    ease: "power2.inOut",
                  },
                  "<"
                );
              }
              return;
            }

            const computedStyle = window.getComputedStyle(loadingScreen);
            const isVisible =
              loadingScreen.style.display !== "none" &&
              loadingScreen.style.visibility !== "hidden" &&
              computedStyle.display !== "none" &&
              computedStyle.visibility !== "hidden";

            if (isVisible) {
              // まだローディング中なので、少し待って再確認
              setTimeout(checkLoadingScreen, 100);
              return;
            }

            // ローディングが終了したらアニメーションを開始
            gsap.set(element, { visibility: "visible" });
            const timeline = gsap.timeline({
              delay,
              onComplete: onAnimationComplete,
            });

            // 途中状態: scale: 1.15, opacity: 0.6（頭を少し奥に傾ける）
            timeline.to(element, {
              scale: 1.15,
              opacity: 0.6,
              rotationX: -20, // 頭を少し奥に傾ける
              transformOrigin: "50% 50%", // 中央を基準点に維持（上から降りてくる動きを避ける）
              y: 0, // Y軸方向の移動を0に維持
              force3D: true, // 3D変換を強制
              duration: duration * 0.6,
              ease: "power2.out",
            });

            // グリッチ効果を強く（途中状態）- 要素が存在する場合のみ
            if (glitchLayers.length === 2) {
              timeline.to(
                glitchLayers,
                {
                  opacity: 0.9, // より強い効果のため少し下げる
                  x: (index) => (index === 0 ? -30 : 30), // オフセットを大きく
                  force3D: true, // 3D変換を強制
                  duration: duration * 0.3,
                  ease: "power2.out",
                  onStart: function (this: gsap.core.Tween) {
                    console.log("Glitch animation started (with loading screen)", {
                      targets: this.targets(),
                      count: this.targets().length,
                    });
                  },
                  onUpdate: function (this: gsap.core.Tween) {
                    // メイン画像の位置を更新（アニメーション中も位置を同期）
                    if (typeof window !== "undefined") {
                      const mainImage = imageRef.current;
                      if (mainImage) {
                        const rect = mainImage.getBoundingClientRect();
                        const targets = this.targets();
                        targets.forEach((target) => {
                          const element = target as HTMLElement;
                          if (element) {
                            element.style.top = `${rect.top}px`;
                            element.style.left = `${rect.left}px`;
                            element.style.width = `${rect.width}px`;
                            element.style.height = `${rect.height}px`;
                          }
                        });
                      }
                    }

                    // 確実にopacityを適用するため、setPropertyで!importantを使用
                    const targets = this.targets();
                    const progress = this.progress();
                    const opacityValue = progress * 0.9;
                    targets.forEach((target, index) => {
                      const element = target as HTMLElement;
                      if (element) {
                        // setPropertyで!importantフラグを使用してCSSを確実に上書き
                        element.style.setProperty("opacity", String(opacityValue), "important");
                        // デバッグ用（最初の数回のみログ出力）
                        if (progress < 0.1 && index === 0) {
                          console.log("Glitch onUpdate:", {
                            progress,
                            opacityValue,
                            styleOpacity: element.style.opacity,
                            computedOpacity: window.getComputedStyle(element).opacity,
                          });
                        }
                      }
                    });
                  },
                },
                "<"
              );
            }

            // 終了状態: scale: 1, opacity: 1（正面を向く）
            timeline.to(element, {
              scale: 1,
              opacity: 1,
              rotationX: 0, // 正面を向く
              transformOrigin: "50% 50%", // 中央を基準点に維持（上から降りてくる動きを避ける）
              y: 0, // Y軸方向の移動を0に維持
              force3D: true, // 3D変換を強制
              duration: duration * 0.4,
              ease: "power2.inOut",
            });

            // グリッチ効果を弱める（終了状態）
            if (glitchLayers.length === 2) {
              timeline.to(
                glitchLayers,
                {
                  opacity: 0,
                  x: 0,
                  duration: duration * 0.4,
                  ease: "power2.inOut",
                },
                "<"
              );
            }
          };

          // 少し遅延させてからチェック開始（DOMが完全に読み込まれるのを待つ）
          setTimeout(checkLoadingScreen, 500);
        } catch (error) {
          console.error("Failed to load GSAP:", error);
          // GSAPの読み込みに失敗した場合、CSSアニメーションにフォールバック
          if (containerRef.current) {
            containerRef.current.classList.add("fallback");
          }
        }
      };

      void initGSAPAnimation();
    };

    // DOMが準備できたら開始（ブラウザ環境でのみ実行）
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startGSAPAnimation);
      } else {
        startGSAPAnimation();
      }
    } else {
      // SSR時は即座に開始
      startGSAPAnimation();
    }
  }, [useGSAP, duration, delay, onAnimationComplete]);

  const containerClassName = `${depthAppearStyles.container} ${useGSAP ? "use-gsap" : ""} ${className ?? ""}`.trim();

  // CSS変数を使用してアニメーション時間とグリッチ効果を制御
  // インラインスタイルの警告は出ますが、CSS変数を使用する場合は許容範囲内です
  const cssVariables = !useGSAP
    ? ({
        "--animation-duration": `${duration}s`,
        "--animation-delay": `${delay}s`,
        "--glitch-offset": "0px",
        "--glitch-opacity": "0",
      } as React.CSSProperties)
    : ({
        "--glitch-offset": "0px",
        "--glitch-opacity": "0",
      } as React.CSSProperties);

  // 画像の読み込み後にグリッチレイヤーのサイズを調整
  useEffect(() => {
    const updateGlitchSize = () => {
      const image = imageRef.current;
      const glitchRed = glitchRedRef.current;
      const glitchBlue = glitchBlueRef.current;

      if (image && glitchRed && glitchBlue) {
        // 画像のサイズをグリッチレイヤーに適用
        const imageWidth = image.offsetWidth;
        const imageHeight = image.offsetHeight;
        if (imageWidth > 0 && imageHeight > 0) {
          glitchRed.style.width = `${imageWidth}px`;
          glitchRed.style.height = `${imageHeight}px`;
          glitchBlue.style.width = `${imageWidth}px`;
          glitchBlue.style.height = `${imageHeight}px`;
        }
      }
    };

    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        updateGlitchSize();
      } else {
        const handleLoad = () => updateGlitchSize();
        image.addEventListener("load", handleLoad);
        return () => {
          image.removeEventListener("load", handleLoad);
        };
      }
    }
    return undefined;
  }, [src]);

  return (
    <div ref={containerRef} className={containerClassName} style={cssVariables}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={depthAppearStyles.image}
        loading="eager"
        fetchPriority="high"
        onError={() => {
          console.error("Failed to load main image:", src);
        }}
      />
      {/* グリッチ効果レイヤー（赤チャンネル） - 実際のimg要素を複製 */}
      <img
        ref={glitchRedRef}
        src={src}
        alt=""
        className={depthAppearStyles.glitchRed}
        data-glitch="red"
        aria-hidden="true"
        loading="eager"
        fetchPriority="low"
        onError={() => {
          console.error("Failed to load glitch red layer:", src);
        }}
      />
      {/* グリッチ効果レイヤー（青チャンネル） - 実際のimg要素を複製 */}
      <img
        ref={glitchBlueRef}
        src={src}
        alt=""
        className={depthAppearStyles.glitchBlue}
        data-glitch="blue"
        aria-hidden="true"
        loading="eager"
        fetchPriority="low"
        onError={() => {
          console.error("Failed to load glitch blue layer:", src);
        }}
      />
    </div>
  );
}
