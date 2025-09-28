import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const soundOn = "emojione:speaker-high-volume";
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
      <Icon icon={isSoundOn ? `${soundOn}` : `${soundOff}`} width="24" height="24" />
    </button>
  );
};

export default SoundToggle;
