const anims = {
  fluidPulse: [
    {
      pulsingLightness: {
        active: true,
        direction: "inward",
        lOffset: 0.05,
        inwardBorderMult: 0,
        inversedMode: { inwardBorderMult: 40 },
        borderDeltaT: 0,
        deltaT: 0,
        speed: 0.4,
        stepping: {
          active: false,
          step: 2,
          nextShape: 0,
          inversedMode: {
            inwardBorderMult: 16,
          },
        },
      },
      fluidLayers: {
        active: true,
        speed: 40,
        firstShape: 0,
        op: "subtract",
        deltaT: 0,
      },
    },
    {
      pulsingLightness: {
        active: true,
        direction: "inward",
        lOffset: 0.05,
        inwardBorderMult: 0,
        inversedMode: { inwardBorderMult: 40 },
        borderDeltaT: 0,
        deltaT: 0,
        speed: 0.4,
        stepping: {
          active: false,
          step: 2,
          nextShape: 0,
          inversedMode: {
            inwardBorderMult: 16,
          },
        },
      },
      fluidLayers: {
        active: true,
        speed: 36,
        firstShape: 10,
        op: "add",
        deltaT: 0,
      },
      rotation: { active: false, speed: 0.0625, angle: 0 },
    },
  ],
  invertedFluidPulse: [
    {
      pulsingLightness: {
        active: true,
        direction: "inward",
        lOffset: 0.05,
        inwardBorderMult: 0,
        inversedMode: { inwardBorderMult: 0 },
        borderDeltaT: 0,
        deltaT: 0,
        speed: 0.4,
        stepping: {
          active: false,
          step: 2,
          nextShape: 0,
          inversedMode: {
            inwardBorderMult: 16,
          },
        },
      },
      fluidLayers: {
        active: true,
        speed: 36,
        firstShape: 10,
        op: "add",
        deltaT: 0,
      },
    },
  ],
};

export default {
  anims,
};
