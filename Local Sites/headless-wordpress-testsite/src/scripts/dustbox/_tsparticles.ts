// import type { Engine, Container } from "tsparticles-engine";
// import { loadFull } from "tsparticles";

// declare global {
//   interface Window {
//     particlesInit?: (engine: Engine) => Promise<void>;
//     particlesLoaded?: (container: Container) => void;
//     tsparticlesContainer?: Container;
//   }
// }

// window.particlesInit = async (engine: Engine): Promise<void> => {
//   await loadFull(engine);
// };

// window.particlesLoaded = (container: Container) => {
//   console.log("Particles loaded successfully");
//   window.tsparticlesContainer = container;
// };
