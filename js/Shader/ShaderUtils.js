export default class ShaderUtils {
  static init2dPureMat = () => new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

  static init3dPureMat = () =>
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  static init2dTranslationMat = (x, y) =>
    new Float32Array([1, 0, 0, 0, 1, 0, x, y, 1]);

  static init3dTranslationMat = (x, y, z) =>
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);

  static init2dScaleMat = (w, h) =>
    new Float32Array([w, 0, 0, 0, h, 0, 0, 0, 1]);

  static init3dScaleMat = (wS, hS, dS) =>
    new Float32Array([wS, 0, 0, 0, 0, hS, 0, 0, 0, 0, dS, 0, 0, 0, 0, 1]);

  static init2dRotationMat = rad => {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return new Float32Array([cos, -sin, 0, sin, cos, 0, 0, 0, 1]);
  };

  static init3dRotationMat = (axis, rad) => {
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    switch (axis) {
      case "x":
        return new Float32Array([
          1,
          0,
          0,
          0,
          0,
          cos,
          -sin,
          0,
          0,
          sin,
          cos,
          0,
          0,
          0,
          0,
          1,
        ]);

      case "y":
        return new Float32Array([
          cos,
          0,
          sin,
          0,
          0,
          1,
          0,
          0,
          -sin,
          0,
          cos,
          0,
          0,
          0,
          0,
          1,
        ]);

      case "z":
        return new Float32Array([
          cos,
          -sin,
          0,
          0,
          sin,
          cos,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
        ]);
    }
  };

  static init2dProjectionMat = (w, h) => [2 / w, 0, 0, 0, -2 / h, 0, -1, 1, 1];

  static initPerspectiveMat = (fov, aspectRatio, near, far) => {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
      f / aspectRatio,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ]);
  };

  static mult2dMats = (baseMat, multMats) => {
    if (!Array.isArray(multMats)) multMats = [multMats];

    let matToMult = baseMat;

    for (const multMat of multMats) {
      let newMat = [];

      for (let row = 0; row < multMat.length; row += 3) {
        const multMatRow = multMat.slice(row, row + 3);

        for (let col = 0; col < 3; col++) {
          let newVal = 0;

          for (
            let i = col, multMatCol = 0;
            i < matToMult.length;
            i += 3, multMatCol++
          ) {
            newVal += matToMult[i] * multMatRow[multMatCol];
          }

          newMat.push(newVal);
        }
      }

      matToMult = newMat;
    }

    return new Float32Array(matToMult);
  };

  static mult3dMats = (firstMat, secondMat) => {
    let newMat = [];

    for (let r = 0; r < secondMat.length; r += 4) {
      const secondMatRow = secondMat.slice(r, r + 4);

      for (let c = 0; c < 4; c++) {
        let newVal = 0;

        for (let i = c, rI = 0; i < firstMat.length; i += 4, rI++) {
          newVal += firstMat[i] * secondMatRow[rI];
        }

        newMat.push(newVal);
      }
    }

    return new Float32Array(newMat);
  };

  static translate3d = (mat, positionOffsets) => {
    if (typeof positionOffsets.x === "number") {
      mat[12] += mat[0] * positionOffsets.x;
      mat[13] += mat[1] * positionOffsets.x;
      mat[14] += mat[2] * positionOffsets.x;
      mat[15] += mat[3] * positionOffsets.x;
    }

    if (typeof positionOffsets.y === "number") {
      mat[12] += mat[4] * positionOffsets.y;
      mat[13] += mat[5] * positionOffsets.y;
      mat[14] += mat[6] * positionOffsets.y;
      mat[15] += mat[7] * positionOffsets.y;
    }

    if (typeof positionOffsets.z === "number") {
      mat[12] += mat[8] * positionOffsets.z;
      mat[13] += mat[9] * positionOffsets.z;
      mat[14] += mat[10] * positionOffsets.z;
      mat[15] += mat[11] * positionOffsets.z;
    }
  };

  static scale = (mat, scaleFactors) => {
    if (typeof scaleFactors.w === "number") {
      mat[0] *= scaleFactors.w;
      mat[1] *= scaleFactors.w;
      mat[2] *= scaleFactors.w;
      mat[3] *= scaleFactors.w;
    }

    if (typeof scaleFactors.h === "number") {
      mat[4] *= scaleFactors.h;
      mat[5] *= scaleFactors.h;
      mat[6] *= scaleFactors.h;
      mat[7] *= scaleFactors.h;
    }

    if (typeof scaleFactors.d === "number") {
      mat[8] *= scaleFactors.d;
      mat[9] *= scaleFactors.d;
      mat[10] *= scaleFactors.d;
      mat[11] *= scaleFactors.d;
    }
  };

  static rotate3d = (mat, axis, rad) => {
    const r0c0 = mat[0];
    const r0c1 = mat[1];
    const r0c2 = mat[2];
    const r0c3 = mat[3];
    const r1c0 = mat[4];
    const r1c1 = mat[5];
    const r1c2 = mat[6];
    const r1c3 = mat[7];
    const r2c0 = mat[8];
    const r2c1 = mat[9];
    const r2c2 = mat[10];
    const r2c3 = mat[11];

    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    switch (axis) {
      case "x":
        mat[4] = r1c0 * cos + r2c0 * sin;
        mat[5] = r1c1 * cos + r2c1 * sin;
        mat[6] = r1c2 * cos + r2c2 * sin;
        mat[7] = r1c3 * cos + r2c3 * sin;
        mat[8] = r2c0 * cos - r1c0 * sin;
        mat[9] = r2c1 * cos - r1c1 * sin;
        mat[10] = r2c2 * cos - r1c2 * sin;
        mat[11] = r2c3 * cos - r1c3 * sin;
        break;

      case "y":
        mat[0] = r0c0 * cos - r2c0 * sin;
        mat[1] = r0c1 * cos - r2c1 * sin;
        mat[2] = r0c2 * cos - r2c2 * sin;
        mat[3] = r0c3 * cos - r2c3 * sin;
        mat[8] = r2c0 * cos + r0c0 * sin;
        mat[9] = r2c1 * cos + r0c1 * sin;
        mat[10] = r2c2 * cos + r0c2 * sin;
        mat[11] = r2c3 * cos + r0c3 * sin;
        break;

      case "z":
        mat[0] = r0c0 * cos + r1c0 * sin;
        mat[1] = r0c1 * cos + r1c1 * sin;
        mat[2] = r0c2 * cos + r1c2 * sin;
        mat[3] = r0c3 * cos + r1c3 * sin;
        mat[4] = r1c0 * cos - r0c0 * sin;
        mat[5] = r1c1 * cos - r0c1 * sin;
        mat[6] = r1c2 * cos - r0c2 * sin;
        mat[7] = r1c3 * cos - r0c3 * sin;
        break;
    }
  };

  static lookAtMat = (
    eye = [0, 0, 1],
    target = [0, 0, 0],
    upVec = [0, 1, 0]
  ) => {
    const eyeToTargetVec = ShaderUtils.subtractVecs(eye, target);

    const zVec = ShaderUtils.normalizeVec(eyeToTargetVec);
    const xVec = ShaderUtils.normalizeVec(
      ShaderUtils.crossProduct(upVec, zVec)
    );
    const yVec = ShaderUtils.normalizeVec(ShaderUtils.crossProduct(zVec, xVec));

    return new Float32Array([
      xVec[0],
      xVec[1],
      xVec[2],
      0,
      yVec[0],
      yVec[1],
      yVec[2],
      0,
      zVec[0],
      zVec[1],
      zVec[2],
      0,
      eye[0],
      eye[1],
      eye[2],
      1,
    ]);
  };

  static dotProduct = (vecA, vecB) =>
    vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];

  static crossProduct = (vecA, vecB) =>
    new Float32Array([
      vecA[1] * vecB[2] - vecB[1] * vecA[2],
      vecA[2] * vecB[0] - vecB[2] * vecA[0],
      vecA[0] * vecB[1] - vecB[0] * vecA[1],
    ]);

  static subtractVecs = (vecA, vecB) =>
    new Float32Array([vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]]);

  static normalizeVec = vec => {
    const length = Math.sqrt(
      Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2)
    );

    return new Float32Array([
      vec[0] / length,
      vec[1] / length,
      vec[2] / length,
    ]);
  };
}
