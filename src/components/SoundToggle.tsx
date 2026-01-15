import { useEffect, useState } from "react";
import IconifyInline from "./IconifyInline";

const soundOn = "twemoji:speaker-high-volume";
const soundOff = "twemoji:muted-speaker";

const SoundToggle = () => {
  const [isSoundOn, setIsSoundOn] = useState(true);

  useEffect(() => {
    const storedSound = localStorage.getItem("sound-enabled");
    if (storedSound !== null) {
      setIsSoundOn(storedSound === "true");
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
      <IconifyInline icon={isSoundOn ? soundOn : soundOff} width="40" height="40" aria-hidden />
    </button>
  );
};

export default SoundToggle;
