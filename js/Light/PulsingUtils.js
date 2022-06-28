export default class PulsingUtils {
  static getAnimsStates(anim, shape) {
    const performPurePulsing = !anim.stepping.active && !anim.cascade.active;

    const performStepPulsing =
      !anim.cascade.active &&
      anim.stepping.active &&
      anim.stepping.nextShape === shape;

    const performCascadePulsing =
      !anim.stepping.active &&
      anim.cascade.active &&
      anim.cascade.controlShape === shape;

    return { performPurePulsing, performStepPulsing, performCascadePulsing };
  }

  static getLightnessOffsetForSubanim(
    anim,
    isInversedModeActive,
    lightness,
    ligthnessStepOffset
  ) {
    const directionBorder = isInversedModeActive ? "inward" : "outward";

    let lightnessBorder;

    if (anim.direction === directionBorder) {
      lightnessBorder = isInversedModeActive
        ? lightness - ligthnessStepOffset
        : lightness + ligthnessStepOffset;
    } else {
      lightnessBorder = lightness;
    }

    return lightnessBorder;
  }

  static lastShapeReached(anim, shape, shapesCount, animsStates) {
    if (animsStates.performStepPulsing) {
      return shape + anim.stepping.step > shapesCount - 1;
    } else if (animsStates.performCascadePulsing) {
      return true;
    } else {
      return shape === shapesCount - 1;
    }
  }

  static getAnimValues(
    anim,
    lightness,
    lightnessStep,
    isLastShape,
    isLastShapeInSegment,
    isInversedModeActive,
    animsStates
  ) {
    const ligthnessStepOffset = anim.inwardBorderMult * lightnessStep;

    let lightnessBorder;
    let stepFurther;

    if (animsStates.performStepPulsing || animsStates.performCascadePulsing) {
      if (isLastShape) {
        lightnessBorder = PulsingUtils.getLightnessOffsetForSubanim(
          anim,
          isInversedModeActive,
          lightness,
          ligthnessStepOffset
        );
      }

      if (animsStates.performStepPulsing) {
        stepFurther = !isLastShapeInSegment;
      }
    } else {
      if (isLastShape) {
        lightnessBorder =
          anim.direction === "inward"
            ? lightness - 1 + ligthnessStepOffset
            : lightness;
      }
    }

    return { lightnessBorder, stepFurther };
  }
}
