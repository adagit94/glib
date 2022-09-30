export default class PulsingUtils {
  static getAnimsStates(anim, shape) {
    const performPurePulsing = !anim.stepping.active && !anim.cascade.active;

    let performStepPulsing = !anim.cascade.active && anim.stepping.active;

    const outlineShape = Object.prototype.hasOwnProperty.call(
      anim.stepping,
      "range"
    );

    if (outlineShape) {
      performStepPulsing =
        performStepPulsing &&
        shape >= anim.stepping.nextShape &&
        shape < anim.stepping.nextShape + anim.stepping.range;
    } else {
      performStepPulsing =
        performStepPulsing && anim.stepping.nextShape === shape;
    }

    const performCascadePulsing =
      !anim.stepping.active &&
      anim.cascade.active &&
      anim.cascade.controlShape === shape;

    return { performPurePulsing, performStepPulsing, performCascadePulsing };
  }

  static getLightnessBorderForSubanim(
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
      const outlineShape = Object.prototype.hasOwnProperty.call(
        anim.stepping,
        "range"
      );

      if (outlineShape) {
        return (
          anim.stepping.nextShape +
            anim.stepping.range -
            1 +
            anim.stepping.step +
            anim.stepping.range -
            1 >
          shapesCount - 1
        );
      }

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
    animsStates,
    shape
  ) {
    const ligthnessStepOffset = anim.inwardBorderMult * lightnessStep;

    let lightnessBorder;
    let stepFurther;

    if (animsStates.performStepPulsing || animsStates.performCascadePulsing) {
      if (isLastShape) {
        lightnessBorder = PulsingUtils.getLightnessBorderForSubanim(
          anim,
          isInversedModeActive,
          lightness,
          ligthnessStepOffset
        );
      }

      if (animsStates.performStepPulsing) {
        const outlineShape = Object.prototype.hasOwnProperty.call(
          anim.stepping,
          "range"
        );

        if (
          !outlineShape ||
          shape === anim.stepping.nextShape + anim.stepping.range - 1
        ) {
          stepFurther = !isLastShapeInSegment;
        }
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
