import { useEffect, useMemo, useState } from "react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import type { IParticlesProps } from "@tsparticles/react";
import { tsparticlesOptions } from "../scripts/tsparticlesOptions";
import { Icon, addCollection, iconLoaded } from "@iconify/react";
import particlesStyles from "../styles/particlesStyles.module.css";
import type React from "react";
import { devLog, devError } from "../util/logger";

const playIconButton = "fluent-emoji:party-popper";
const pauseIconButton = "fluent-emoji-high-contrast:party-popper";
const stopIconButton = "fluent-emoji:magic-wand";

let playSound: HTMLAudioElement | null = null;
let pauseSound: HTMLAudioElement | null = null;
let stopSound: HTMLAudioElement | null = null;

// アイコンの読み込み状態をグローバルに管理（複数回の読み込みを防ぐ）
let iconLoadPromise: Promise<void> | null = null;
let iconsLoaded = false;

declare global {
  interface Window {
    tsparticlesContainer?: Container;
  }
}

/**
 * アイコンコレクションを読み込む（リトライ機能付き）
 * @param retries リトライ回数（デフォルト: 3）
 * @param delay リトライ間隔（ミリ秒、デフォルト: 1000）
 */
async function loadIconCollections(retries = 3, delay = 1000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 動的インポートをプリロード（ブラウザのプリフェッチを活用）
      const [fluentEmojiModule, fluentEmojiHCModule] = await Promise.all([
        import("@iconify-json/fluent-emoji"),
        import("@iconify-json/fluent-emoji-high-contrast"),
      ]);

      const fluentEmojiIcons = fluentEmojiModule.icons;
      const fluentEmojiHighContrastIcons = fluentEmojiHCModule.icons;

      // コレクション全体を登録（必要なアイコンを含む）
      addCollection(fluentEmojiIcons);
      addCollection(fluentEmojiHighContrastIcons);

      // アイコンが正しく登録されているか確認
      const partyPopperLoaded = iconLoaded(playIconButton);
      const magicWandLoaded = iconLoaded(stopIconButton);
      const partyPopperHCLoaded = iconLoaded(pauseIconButton);

      if (partyPopperLoaded && magicWandLoaded && partyPopperHCLoaded) {
        iconsLoaded = true;
        devLog("Icon collections registered successfully:", {
          partyPopper: partyPopperLoaded,
          magicWand: magicWandLoaded,
          partyPopperHC: partyPopperHCLoaded,
        });
        return;
      } else {
        throw new Error("Icons not properly registered after import");
      }
    } catch (error) {
      if (attempt === retries) {
        devError(`Failed to load icon data after ${retries} attempts:`, error);
        throw error;
      }
      devLog(`Icon load attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      // 指数バックオフ: リトライ間隔を徐々に増やす
      delay = Math.min(delay * 1.5, 5000);
    }
  }
}

export default function ParticlesComponent() {
  const [ready, setReady] = useState(false);
  const [ParticlesLib, setParticlesLib] = useState<React.FC<IParticlesProps> | null>(null);
  const [iconsReady, setIconsReady] = useState(false);

  useEffect(() => {
    // Initialize audio only in browser
    if (typeof window !== "undefined") {
      playSound = new Audio("/sounds/playSound.mp3");
      pauseSound = new Audio("/sounds/pauseSound.mp3");
      stopSound = new Audio("/sounds/stopSound.mp3");
    }

    // アイコンをローカルレジストリに登録（外部APIリクエストを回避）
    // ビルド時にバンドルされるため、実行時の外部APIリクエストが不要
    // グローバルな読み込み状態をチェックして、重複読み込みを防ぐ
    void (async () => {
      if (iconsLoaded) {
        setIconsReady(true);
        return;
      }

      if (iconLoadPromise) {
        // 既に読み込み中の場合は、そのPromiseを待つ
        try {
          await iconLoadPromise;
          setIconsReady(true);
        } catch (error) {
          devError("Failed to load icons from existing promise:", error);
          setIconsReady(false);
        }
        return;
      }

      // 新しい読み込みを開始
      iconLoadPromise = loadIconCollections();
      try {
        await iconLoadPromise;
        setIconsReady(true);
      } catch (error) {
        devError("Failed to load icon data:", error);
        setIconsReady(false);
      }
    })();

    // Load tsparticles dynamically
    void (async () => {
      try {
        const [{ default: Particles, initParticlesEngine }, { loadSlim }, { loadStarShape }] = await Promise.all([
          import("@tsparticles/react"),
          import("@tsparticles/slim"),
          import("@tsparticles/shape-star"),
        ]);

        await initParticlesEngine(async (engine: Engine) => {
          await loadSlim(engine);
          await loadStarShape(engine);
          devLog("tsParticles engine loaded (slim + star)");
        });

        setParticlesLib(() => Particles);
        setReady(true);
      } catch (error) {
        devError("Failed to load tsParticles:", error);
      }
    })();
  }, []);

  const defaultOptions: ISourceOptions = useMemo(() => {
    return {
      ...tsparticlesOptions,
      particles: {
        ...tsparticlesOptions.particles!,
        move: {
          ...tsparticlesOptions.particles!.move,
          enable: false,
        },
      },
    };
  }, []);

  // Particlesライブラリが準備できてから表示（アイコンは読み込み中でも表示可能）
  if (!ready || ParticlesLib === null) return null;

  const handlePlay = () => {
    const container = window.tsparticlesContainer;
    if (!container) return;

    container.options.particles.move.enable = true;
    container.options.particles.number.value = 160;

    void container.refresh().then(() => {
      container.play();
    });

    const isSoundOn = localStorage.getItem("sound-enabled") === "true";

    if (isSoundOn && playSound) {
      try {
        playSound.currentTime = 0;
        void playSound.play();
      } catch (error) {
        devError("Failed to play sound:", error);
      }
    }
  };

  const handlePause = () => {
    window.tsparticlesContainer?.pause();

    const isSoundOn = localStorage.getItem("sound-enabled") === "true";

    if (isSoundOn && pauseSound) {
      try {
        pauseSound.currentTime = 0;
        void pauseSound.play();
      } catch (error) {
        devError("Failed to play sound:", error);
      }
    }
  };

  const handleStop = () => {
    const container = window.tsparticlesContainer;
    if (!container) return;

    container.options.particles.move.enable = false;
    container.options.particles.number.value = 0;

    void container.refresh().then(() => {
      container.stop();
    });

    const isSoundOn = localStorage.getItem("sound-enabled") === "true";

    if (isSoundOn && stopSound) {
      try {
        stopSound.currentTime = 0;
        void stopSound.play();
      } catch (error) {
        devError("Failed to play sound:", error);
      }
    }
  };

  // アイコンのフォールバック（読み込み失敗時や読み込み中）
  const renderIcon = (iconName: string, className?: string) => {
    if (iconsReady && iconName !== null && iconName !== "" && iconLoaded(iconName)) {
      const iconClassName = className ?? particlesStyles.particles__icon;
      return <Icon className={iconClassName} icon={iconName} width="56" height="56" />;
    }
    // フォールバック: シンプルなテキスト表示（アイコンが読み込めない場合）
    const fallbackText =
      iconName === playIconButton
        ? "▶"
        : iconName === pauseIconButton
          ? "⏸"
          : iconName === stopIconButton
            ? "⏹"
            : "?";
    const iconClassName = className ?? particlesStyles.particles__icon;
    return (
      <span className={`${iconClassName} ${particlesStyles.iconFallback}`} aria-hidden="true">
        {fallbackText}
      </span>
    );
  };

  return (
    <>
      <div className={particlesStyles.particles__inner}>
        <div className={particlesStyles.particlesButton__inner}>
          <button
            className={particlesStyles.particlesButton}
            onClick={handlePlay}
            type="button"
            aria-label="Play particles animation"
            title="Play"
          >
            {renderIcon(playIconButton)}
          </button>
          <button
            className={particlesStyles.particlesButton}
            onClick={handlePause}
            type="button"
            aria-label="Pause particles animation"
            title="Pause"
          >
            {renderIcon(pauseIconButton, `${particlesStyles.particles__icon} ${particlesStyles.pauseIcon}`)}
          </button>
          <button
            className={particlesStyles.particlesButton}
            onClick={handleStop}
            type="button"
            aria-label="Stop particles animation"
            title="Stop"
          >
            {renderIcon(stopIconButton)}
          </button>
        </div>
        <ParticlesLib
          id="tsparticles"
          options={defaultOptions}
          particlesLoaded={(container?: Container): Promise<void> => {
            window.tsparticlesContainer = container;
            devLog("Particles loaded");
            return Promise.resolve();
          }}
        />
      </div>
    </>
  );
}
