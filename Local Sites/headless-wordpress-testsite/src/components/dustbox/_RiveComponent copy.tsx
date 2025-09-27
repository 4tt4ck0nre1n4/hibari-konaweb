import React, { useEffect } from "react";
import { useRive } from "@rive-app/react-canvas";

import {
  Layout as RiveLayout,
  Fit as RiveFit,
  Alignment as RiveAlignment,
  RuntimeLoader,
} from "@rive-app/react-canvas";

interface RiveComponentProps {
  src: string;
  artboard?: string;
  stateMachines?: string | string[];
  autoplay?: boolean;
}

const RiveComponent: React.FC<RiveComponentProps> = ({ src, artboard, stateMachines, autoplay = true }) => {
  useEffect(() => {
    RuntimeLoader.setWasmUrl("/node_modules/@rive-app/canvas/rive.wasm");
    RuntimeLoader.load().catch(console.error);
  }, []);

  const layout = new RiveLayout({
    fit: RiveFit.Contain,
    alignment: RiveAlignment.Center,
  });

  const { RiveComponent: InnerRive } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    layout,
  });

  return <InnerRive />;
};

export default RiveComponent;

// export default function RiveComponent({
//   src,
//   artboard,
//   stateMachines,
//   autoPlay = true,
// }: RiveComponentProps) {
//   useEffect(() => {
//     RuntimeLoader.setWasmUrl("/node_modules/@rive-app/canvas/rive.wasm");
//     RuntimeLoader.load().then(() => {
//       console.log("Rive WASM preloaded");
//     });
//   }, []);

//   const layout = new Layout({
//     fit: Fit.Contain,
//     alignment: Alignment.Center,
//   });

//   const { RiveComponet } = useRive({
//     src,
//     artboard,
//     stateMachines,
//     autoplay,
//     layout,
//   });

//   return <InnerRive />;
// };

// export default RiveComponent;

// const RiveComponent: React.FC<RiveComponentProps> = ({
//   src,
//   artboard,
//   stateMachines,
//   autoplay = true,
// }) => {
//   const { RiveComponent } = useRive({
//     src,
//     artboard,
//     stateMachines,
//     autoplay,
//   });

//   return <RiveComponent/>;
// };

// export default RiveComponent;
