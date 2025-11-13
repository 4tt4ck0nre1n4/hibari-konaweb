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
          container.style.opacity = "0.07";
          container.style.transform = "scale(0.2)";
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
    // 位置更新ループの制御変数（クリーンアップ用）
    let positionUpdateActive = true;
    let positionRafId: number | null = null;

    const startGSAPAnimation = () => {
      const initGSAPAnimation = async () => {
        try {
          const { gsap } = await import("gsap");
          const element = imageRef.current || containerRef.current;

          if (!element) return;

          // 初期状態：画面奥（小さく、透明、非表示）
          gsap.set(element, {
            scale: 0.07,
            opacity: 0.2,
            transformOrigin: "50% 50%", // 中央を基準点に設定
            y: 0, // Y軸方向の移動を0に設定
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
            // この関数は継続的に実行され、GSAPのアニメーション中も位置を上書きし続ける
            positionUpdateActive = true;

            const updateGlitchPosition = () => {
              if (!positionUpdateActive) return;

              const mainImage = imageRef.current;
              if (mainImage && typeof window !== "undefined") {
                const rect = mainImage.getBoundingClientRect();
                glitchLayers.forEach((layer) => {
                  if (layer instanceof HTMLElement) {
                    layer.style.position = "fixed";
                    // !importantで確実に適用（GSAPの影響を完全に排除）
                    layer.style.setProperty("top", `${rect.top}px`, "important");
                    layer.style.setProperty("left", `${rect.left}px`, "important");
                    layer.style.setProperty("width", `${rect.width}px`, "important");
                    layer.style.setProperty("height", `${rect.height}px`, "important");
                    // transformを完全にリセット（GSAPのxプロパティの影響を排除）
                    layer.style.setProperty("transform", "translateX(0) translateY(0) scale(1)", "important");
                    // GSAPが設定した可能性のある全てのtransformプロパティをクリア
                    gsap.set(layer, {
                      x: 0,
                      y: 0,
                      clearProps: "x,y,transform,transformOrigin",
                    });
                  }
                });
              }

              // 継続的に位置を更新（アニメーション中も位置を維持）
              if (positionUpdateActive) {
                positionRafId = requestAnimationFrame(updateGlitchPosition);
              }
            };

            // 初期位置を設定
            updateGlitchPosition();

            // リサイズ時やスクロール時にも位置を更新
            if (typeof window !== "undefined") {
              window.addEventListener(
                "resize",
                () => {
                  if (positionUpdateActive) {
                    updateGlitchPosition();
                  }
                },
                { passive: true }
              );
              window.addEventListener(
                "scroll",
                () => {
                  if (positionUpdateActive) {
                    updateGlitchPosition();
                  }
                },
                { passive: true }
              );
            }

            // 初期状態を直接スタイルで設定（GSAPの前に確実に設定）
            glitchLayers.forEach((layer) => {
              layer.style.setProperty("opacity", "0", "important");
              layer.style.transform = "translateX(0) translateY(0)";
              layer.style.visibility = "visible";
              // GSAPのxプロパティを使わないように、位置は常にstyleで制御
              layer.style.setProperty("left", "0px", "important");
              layer.style.setProperty("top", "0px", "important");
            });
            gsap.set(glitchLayers, {
              opacity: 0,
              // xプロパティは使わない（position: fixedの場合はleft/topで制御）
              visibility: "visible",
              force3D: true, // 3D変換を強制
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
                onComplete: () => {
                  // アニメーション完了時にグリッチレイヤーの位置を確実にリセット
                  if (glitchLayers.length === 2) {
                    glitchLayers.forEach((layer) => {
                      if (layer instanceof HTMLElement) {
                        // GSAPが設定した可能性のある全てのプロパティをクリア
                        gsap.set(layer, {
                          x: 0,
                          y: 0,
                          clearProps: "x,y,transform,transformOrigin",
                        });
                        // 位置を確実に更新
                        const mainImage = imageRef.current;
                        if (mainImage && typeof window !== "undefined") {
                          const rect = mainImage.getBoundingClientRect();
                          layer.style.setProperty("top", `${rect.top}px`, "important");
                          layer.style.setProperty("left", `${rect.left}px`, "important");
                          layer.style.setProperty("transform", "translateX(0) translateY(0) scale(1)", "important");
                        }
                      }
                    });
                  }
                  // アニメーション完了時も位置更新ループは継続（位置を維持）
                  if (onAnimationComplete) {
                    onAnimationComplete();
                  }
                },
              });

              // 途中状態: scale: 1.1, opacity: 0.5
              timeline.to(element, {
                scale: 1.1,
                opacity: 0.5,
                transformOrigin: "50% 50%", // 中央を基準点に維持
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
                    opacity: 0.3, // グリッチ効果の最大opacity
                    // xプロパティは使わない（position: fixedの場合はleft/topで制御）
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
                      // 位置の更新は独立したrequestAnimationFrameループで行うため、ここではopacityのみ制御
                      // 確実にopacityを適用するため、直接スタイルを設定
                      const targets = this.targets();
                      const progress = this.progress();
                      const opacityValue = progress * 0.3; // 最大opacityを0.3に変更
                      targets.forEach((target, index) => {
                        const element = target as HTMLElement | null;
                        if (element && element instanceof HTMLElement) {
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

              // 終了状態: scale: 1, opacity: 1
              timeline.to(element, {
                scale: 1,
                opacity: 1,
                transformOrigin: "50% 50%", // 中央を基準点に維持
                y: 0, // Y軸方向の移動を0に維持
                force3D: true, // 3D変換を強制
                duration: duration * 0.4,
                ease: "power2.inOut",
              });

              // グリッチ効果を弱める（終了状態）- anime.pngより先に消えるように早めに開始
              if (glitchLayers.length === 2) {
                timeline.to(
                  glitchLayers,
                  {
                    opacity: 0,
                    // xプロパティは使わない（position: fixedの場合はleft/topで制御）
                    duration: duration * 0.2, // 少し短くして早めに消える
                    ease: "power2.inOut",
                    onUpdate: function (this: gsap.core.Tween) {
                      // 位置の更新は独立したrequestAnimationFrameループで行うため、ここではopacityのみ制御
                      // opacityの更新のみ行う
                    },
                    onComplete: function (this: gsap.core.Tween) {
                      // アニメーション完了時にGSAPが設定した全てのプロパティをクリア
                      const targets = this.targets();
                      targets.forEach((target) => {
                        if (target instanceof HTMLElement) {
                          gsap.set(target, {
                            x: 0,
                            y: 0,
                            clearProps: "x,y,transform,transformOrigin",
                          });
                        }
                      });
                    },
                  },
                  "<0.3" // メイン画像のアニメーションの10%の時点で開始（先に消える）
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
              onComplete: () => {
                // アニメーション完了時にグリッチレイヤーの位置を確実にリセット
                if (glitchLayers.length === 2) {
                  glitchLayers.forEach((layer) => {
                    if (layer instanceof HTMLElement) {
                      // GSAPが設定した可能性のある全てのプロパティをクリア
                      gsap.set(layer, {
                        x: 0,
                        y: 0,
                        clearProps: "x,y,transform,transformOrigin",
                      });
                      // 位置を確実に更新
                      const mainImage = imageRef.current;
                      if (mainImage && typeof window !== "undefined") {
                        const rect = mainImage.getBoundingClientRect();
                        layer.style.setProperty("top", `${rect.top}px`, "important");
                        layer.style.setProperty("left", `${rect.left}px`, "important");
                        layer.style.setProperty("transform", "translateX(0) translateY(0) scale(1)", "important");
                      }
                    }
                  });
                }
                // アニメーション完了時も位置更新ループは継続（位置を維持）
                if (onAnimationComplete) {
                  onAnimationComplete();
                }
              },
            });

            // 途中状態: scale: 1.1, opacity: 0.4
            timeline.to(element, {
              scale: 1.1,
              opacity: 0.4,
              transformOrigin: "50% 50%", // 中央を基準点に維持
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
                  opacity: 0.3, // グリッチ効果の最大opacity
                  // xプロパティは使わない（position: fixedの場合はleft/topで制御）
                  force3D: true, // 3D変換を強制
                  duration: duration * 0.3,
                  ease: "power2.inOut",
                  onStart: function (this: gsap.core.Tween) {
                    console.log("Glitch animation started (with loading screen)", {
                      targets: this.targets(),
                      count: this.targets().length,
                    });
                  },
                  onUpdate: function (this: gsap.core.Tween) {
                    // 位置の更新は独立したrequestAnimationFrameループで行うため、ここではopacityのみ制御
                    // 確実にopacityを適用するため、setPropertyで!importantを使用
                    const targets = this.targets();
                    const progress = this.progress();
                    const opacityValue = progress * 0.6; // 最大opacityを0.6に変更
                    targets.forEach((target, index) => {
                      const element = target as HTMLElement | null;
                      if (element && element instanceof HTMLElement) {
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

            // 終了状態: scale: 1, opacity: 1
            timeline.to(element, {
              scale: 1,
              opacity: 1,
              transformOrigin: "50% 50%", // 中央を基準点に維持
              y: 0, // Y軸方向の移動を0に維持
              force3D: true, // 3D変換を強制
              duration: duration * 0.4,
              ease: "power2.inOut",
            });

            // グリッチ効果を弱める（終了状態）- anime.pngより先に消えるように早めに開始
            if (glitchLayers.length === 2) {
              timeline.to(
                glitchLayers,
                {
                  opacity: 0,
                  // xプロパティは使わない（position: fixedの場合はleft/topで制御）
                  duration: duration * 0.2, // 少し短くして早めに消える
                  ease: "power2.inOut",
                  onUpdate: function (this: gsap.core.Tween) {
                    // 位置の更新は独立したrequestAnimationFrameループで行うため、ここではopacityのみ制御
                    // opacityの更新のみ行う
                  },
                  onComplete: function (this: gsap.core.Tween) {
                    // アニメーション完了時にGSAPが設定した全てのプロパティをクリア
                    const targets = this.targets();
                    targets.forEach((target) => {
                      if (target instanceof HTMLElement) {
                        gsap.set(target, {
                          x: 0,
                          y: 0,
                          clearProps: "x,y,transform,transformOrigin",
                        });
                      }
                    });
                  },
                },
                "<0.3" // メイン画像のアニメーションの10%の時点で開始（先に消える）
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

    // クリーンアップ関数：位置更新ループを停止
    return () => {
      positionUpdateActive = false;
      if (positionRafId !== null && typeof window !== "undefined") {
        cancelAnimationFrame(positionRafId);
        positionRafId = null;
      }
    };
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
