import AnimatedSpriteStyles from "../styles/animatedSpriteStyles.module.css";

type AnimatedSpriteProps = {
  className?: string;
  src: string;
  width: number;
  height: number;
  frameCount: number;
  frameRate: number;
};

export const AnimatedSprite = ({ className, src, width, height, frameCount, frameRate }: AnimatedSpriteProps) => {
  return (
    <div className={`${AnimatedSpriteStyles.sprite} ${className ?? ""}`}>
      <img src={src} alt="Animated Sprite" width={width} height={height} />
    </div>
  );
};
