import ShaderUtils from './../Shader/ShaderUtils.js';

export default class Circle {
  constructor(x, y, r, angle, verticesCount) {
    this.mat = ShaderUtils.init2dTranslationMat(x, y);
    this.verticesCount = verticesCount;

    this.#create(r, angle, verticesCount);
  }

  mat;
  verticesCount;
  coordinates;

  #create(r, angle, verticesCount) {
    const angleStep = angle / verticesCount;

    let coordinates = [];

    for (
      let vertex = 0, rad = 0;
      vertex <= verticesCount;
      rad += angleStep, vertex++
    ) {
      const x = Math.cos(rad) * r;
      const y = Math.sin(rad) * r;

      coordinates.push(x, y);
    }

    this.coordinates = new Float32Array(coordinates);
  }
}
