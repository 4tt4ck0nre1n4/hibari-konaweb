import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import type { IParticlesProps } from "@tsparticles/react";
import { tsparticlesOptions } from "../scripts/tsparticlesOptions";
import type { IconifyInlineProps } from "./IconifyInline";
import particlesStyles from "../styles/particlesStyles.module.css";
import type React from "react";
import { devLog, devError } from "../util/logger";

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
  const [IconifyInline, setIconifyInline] = useState<ComponentType<IconifyInlineProps> | null>(null);

  useEffect(() => {
    // Initialize audio only in browser
    if (typeof window !== "undefined") {
      playSound = new Audio("/sounds/playSound.mp3");
      pauseSound = new Audio("/sounds/pauseSound.mp3");
      stopSound = new Audio("/sounds/stopSound.mp3");
    }

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

    // ネットワーク依存関係ツリー最適化: IconifyInlineの読み込みをrequestIdleCallbackで遅延
    // クリティカルパスをブロックしないように、アイコン読み込みを非同期で実行
    const loadIconify = () => {
      import("./IconifyInline")
        .then((mod) => {
          setIconifyInline(() => mod.default);
        })
        .catch(() => {
          setIconifyInline(null);
        });
    };

    // requestIdleCallbackで遅延読み込み（クリティカルパスをブロックしない）
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadIconify, { timeout: 3000 });
    } else {
      // フォールバック: setTimeoutで遅延読み込み
      setTimeout(loadIconify, 200);
    }
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

  // Particlesライブラリが準備できてから表示
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

  // IconifyInlineを使用してアイコンを表示（外部APIリクエストを完全に排除）
  const renderIcon = (iconName: string, className?: string) => {
    const iconClassName = className ?? particlesStyles.particles__icon;
    if (!IconifyInline) {
      return (
        <svg
          width="56"
          height="56"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className={iconClassName}
          aria-hidden="true"
          role="presentation"
          focusable="false"
        />
      );
    }
    // IconifyInline はデフォルトで aria-hidden を付与するため、ここでは指定しない
    return <IconifyInline icon={iconName} width="56" height="56" className={iconClassName} />;
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
