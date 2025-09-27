import { useRive } from "@rive-app/react-canvas";

interface RiveProps {
  src: string;
}

function Rive({ src }: RiveProps) {
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
  });

  return (
    <>
      <RiveComponent />
    </>
  );
}

export default Rive;
