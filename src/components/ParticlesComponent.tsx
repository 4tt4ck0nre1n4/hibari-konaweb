import { useEffect, useMemo, useState } from "react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import type { IParticlesProps } from "@tsparticles/react";
import { tsparticlesOptions } from "../scripts/tsparticlesOptions";
import { Icon, addCollection, iconLoaded } from "@iconify/react";
import particlesStyles from "../styles/particlesStyles.module.css";
import type React from "react";

const playIconButton = "fluent-emoji:party-popper";
const pauseIconButton = "fluent-emoji-high-contrast:party-popper";
const stopIconButton = "fluent-emoji:magic-wand";

let playSound: HTMLAudioElement | null = null;
let pauseSound: HTMLAudioElement | null = null;
let stopSound: HTMLAudioElement | null = null;

declare global {
  interface Window {
    tsparticlesContainer?: Container;
  }
}

export default function ParticlesComponent() {
  const [ready, setReady] = useState(false);
  const [ParticlesLib, setParticlesLib] = useState<React.FC<IParticlesProps> | null>(null);

  useEffect(() => {
    // Initialize audio only in browser
    if (typeof window !== "undefined") {
      playSound = new Audio("/sounds/playSound.mp3");
      pauseSound = new Audio("/sounds/pauseSound.mp3");
      stopSound = new Audio("/sounds/stopSound.mp3");
    }

    // アイコンをローカルレジストリに登録（外部APIリクエストを回避）
    // ビルド時にバンドルされるため、実行時の外部APIリクエストが不要
    void (async () => {
      try {
        const [{ icons: fluentEmojiIcons }, { icons: fluentEmojiHighContrastIcons }] = await Promise.all([
          import("@iconify-json/fluent-emoji"),
          import("@iconify-json/fluent-emoji-high-contrast"),
        ]);

        // コレクション全体を登録（必要なアイコンを含む）
        addCollection(fluentEmojiIcons);
        addCollection(fluentEmojiHighContrastIcons);

        // アイコンが正しく登録されているか確認
        const partyPopperLoaded = iconLoaded(playIconButton);
        const magicWandLoaded = iconLoaded(stopIconButton);
        const partyPopperHCLoaded = iconLoaded(pauseIconButton);

        console.log("Icon collections registered:", {
          partyPopper: partyPopperLoaded,
          magicWand: magicWandLoaded,
          partyPopperHC: partyPopperHCLoaded,
        });
      } catch (error) {
        console.error("Failed to load icon data:", error);
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
          console.log("tsParticles engine loaded (slim + star)");
        });

        setParticlesLib(() => Particles);
        setReady(true);
      } catch (error) {
        console.error("Failed to load tsParticles:", error);
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
        console.error("Failed to play sound:", error);
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
        console.error("Failed to play sound:", error);
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
        console.error("Failed to play sound:", error);
      }
    }
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
            <Icon className={particlesStyles.particles__icon} icon={playIconButton} width="56" height="56" />
          </button>
          <button
            className={particlesStyles.particlesButton}
            onClick={handlePause}
            type="button"
            aria-label="Pause particles animation"
            title="Pause"
          >
            <Icon
              className={`${particlesStyles.particles__icon} ${particlesStyles.pauseIcon}`}
              icon={pauseIconButton}
              width="56"
              height="56"
            />
          </button>
          <button
            className={particlesStyles.particlesButton}
            onClick={handleStop}
            type="button"
            aria-label="Stop particles animation"
            title="Stop"
          >
            <Icon className={particlesStyles.particles__icon} icon={stopIconButton} width="56" height="56" />
          </button>
        </div>
        <ParticlesLib
          id="tsparticles"
          options={defaultOptions}
          particlesLoaded={(container?: Container): Promise<void> => {
            window.tsparticlesContainer = container;
            console.log("Particles loaded");
            return Promise.resolve();
          }}
        />
      </div>
    </>
  );
}
