import ShaderUtils from "../Shader/ShaderUtils";

export default class Square {
  constructor(centerX, centerY, length) {
    this.mat = ShaderUtils.init2dTranslationMat(centerX, centerY);

    this.#initSquare(length);
  }

  mat;
  coordinates;

  #initSquare(length) {
    const coordinates = [0, 0, length, 0, length, length, 0, length];

    this.coordinates = new Float32Array(coordinates);
  }
}
