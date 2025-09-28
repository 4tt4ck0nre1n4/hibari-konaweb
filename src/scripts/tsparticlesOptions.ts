import { type ISourceOptions } from "@tsparticles/engine";

export const tsparticlesOptions: ISourceOptions = {
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: false,
        mode: "repulse",
      },
      onClick: {
        enable: false,
        mode: "push",
      },
    },
    modes: {
      repulse: {
        distance: 100,
      },
      push: {
        quantity: 4,
      },
    },
  },
  particles: {
    number: {
      value: 0,
      // value: 120,
      density: {
        enable: true,
        width: 1920,
        height: 1080,
      },
    },
    color: {
      value: "random",
    },
    shape: {
      type: "star",
    },
    opacity: {
      // value: 0.5
      value: 1,
    },
    size: {
      // value: 5
      value: {
        min: 2,
        max: 5,
      },
      animation: {
        enable: true,
        speed: 5,
        sync: true,
        startValue: "min",
      },
    },
    move: {
      // enable: true,
      enable: false,
      speed: 2,
      direction: "top",
      angle: {
        value: 25,
        offset: 0,
      },
      outModes: {
        default: "out",
      },
    },
  },
  emitters: {
    direction: "top",
    life: {
      count: 0,
      duration: 0,
      delay: 0,
    },
    rate: {
      quantity: 5,
      delay: 0.1,
    },
    size: {
      width: 30,
      height: 0,
      mode: "percent",
    },
    position: {
      x: 50,
      y: 100,
    },
  },
};
