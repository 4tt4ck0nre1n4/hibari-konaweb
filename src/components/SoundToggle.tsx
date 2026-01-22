import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import type { IconifyInlineProps } from "./IconifyInline";

const soundOn = "twemoji:speaker-high-volume";
const soundOff = "twemoji:muted-speaker";

const SoundToggle = () => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [IconifyInline, setIconifyInline] = useState<ComponentType<IconifyInlineProps> | null>(null);

  useEffect(() => {
    const storedSound = localStorage.getItem("sound-enabled");
    if (storedSound !== null) {
      setIsSoundOn(storedSound === "true");
    }

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

  const toggleSound = () => {
    const newValue = !isSoundOn;
    setIsSoundOn(newValue);
    localStorage.setItem("sound-enabled", newValue.toString());
  };

  return (
    <button
      id="soundToggle"
      onClick={toggleSound}
      type="button"
      aria-label={`サウンド${isSoundOn ? "OFF" : "ON"}に切り替え`}
      title={`サウンド${isSoundOn ? "OFF" : "ON"}に切り替え`}
    >
      {IconifyInline ? (
        <IconifyInline icon={isSoundOn ? soundOn : soundOff} width="40" height="40" aria-hidden />
      ) : (
        <svg width="40" height="40" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" />
      )}
    </button>
  );
};

export default SoundToggle;
