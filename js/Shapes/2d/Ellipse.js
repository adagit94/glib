import ShaderUtils from "../../Shader/ShaderUtils.js";

export default class Ellipse {
  constructor(x, y, rx, ry, angle, verticesCount) {
    this.mat = ShaderUtils.init2dTranslationMat(x, y);
    this.verticesCount = verticesCount;

    this.#create(rx, ry, angle, verticesCount);
  }

  mat;
  verticesCount;
  coordinates;

  #create(rx, ry, angle, verticesCount) {
    const angleStep = angle / verticesCount;

    let coordinates = [];

    for (
      let vertex = 0, rad = 0;
      vertex <= verticesCount;
      rad += angleStep, vertex++
    ) {
      const x = Math.cos(rad) * rx;
      const y = Math.sin(rad) * ry;

      coordinates.push(x, y);
    }

    this.coordinates = new Float32Array(coordinates);
  }
}

export class Ellipse3d {
  constructor(x, y, z, rx, ry, angle, verticesCount) {
    this.mat = ShaderUtils.init3dTranslationMat(x, y, z);
    this.verticesCount = verticesCount;

    this.#create(z, rx, ry, angle, verticesCount);
  }

  mat;
  verticesCount;
  coordinates;

  #create(z, rx, ry, angle, verticesCount) {
    const angleStep = angle / verticesCount;

    let coordinates = [];

    for (
      let vertex = 0, rad = 0;
      vertex <= verticesCount;
      rad += angleStep, vertex++
    ) {
      const x = Math.cos(rad) * rx;
      const y = Math.sin(rad) * ry;

      coordinates.push(x, y, z);
    }

    this.coordinates = new Float32Array(coordinates);
  }
}
