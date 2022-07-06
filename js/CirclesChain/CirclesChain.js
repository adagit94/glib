import Shader from '../Shader/Shader.js';
import Circle from '../Shapes/Circle.js';
import ShaderUtils from '../Shader/ShaderUtils.js';

export default class CirclesChain extends Shader {
  constructor(shaders) {
    super();

    this.initShaders(shaders).then(programs => {
      const [circle] = programs;

      this.#circle.program = circle;

      this.#initLocations(programs);
      this.#initObjectsData();

      this.requestAnimationFrame();
    });
  }

  #chain = {};
  #circle = {};

  #initLocations(programs) {
    const locations = this.initCommonLocations(programs);

    this.#circle.locations = {
      ...locations[0],
      color: this.gl.getUniformLocation(this.#circle.program, 'u_color'),
    };
  }

  #initObjectsData() {
    this.#initCircleData();
  }

  #initCircleData() {
    const vao = this.gl.createVertexArray();

    const r = (this.gl.canvas.width + this.gl.canvas.height) / 2 / 20;
    const circle = new Circle(0, this.gl.canvas.height, r, Math.PI * 2, 100);

    this.gl.bindVertexArray(vao);

    this.#circle.vao = vao;
    this.#circle.verticesCount = circle.coordinates.length / 2;
    this.#circle.instance = circle;
    this.#circle.r = r;
    this.#circle.innerCircles = 1;
    this.#circle.spacing = {
      x: (this.gl.canvas.width / 100) * 15,
      y: (this.gl.canvas.height / 100) * 15,
    };
    this.#circle.mat = ShaderUtils.mult2dMats(this.projectionMat, circle.mat);
    this.#circle.buffers = {
      vertex: this.createAndBindVerticesBuffer(
        this.#circle.locations.pos,
        circle.coordinates,
        { size: 2 }
      ),
    };
  }

  #renderCircles() {
    const {
      mat: circleMat,
      locations,
      program,
      vao,
      verticesCount,
      spacing,
      r,
      innerCircles,
    } = this.#circle;

    this.gl.useProgram(program);
    this.gl.bindVertexArray(vao);

    for (
      let xOffset = spacing.x, yOffset = -spacing.y, scale = 1;
      xOffset + r * scale < this.gl.canvas.width &&
      yOffset * -1 + r * scale < this.gl.canvas.height;
      xOffset += spacing.x - (xOffset / this.gl.canvas.width) * 10,
        yOffset -= spacing.y - ((yOffset * -1) / this.gl.canvas.height) * 10,
        scale =
          1 -
          (xOffset / this.gl.canvas.width +
            (yOffset * -1) / this.gl.canvas.height) /
            2
    ) {
      const mat = ShaderUtils.mult2dMats(circleMat, [
        ShaderUtils.init2dTranslationMat(xOffset, yOffset),
        ShaderUtils.init2dScaleMat(scale, scale),
      ]);

      this.gl.uniformMatrix3fv(locations.mat, false, mat);
      this.gl.uniform3f(locations.color, 1, 1, 1);

      this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, verticesCount - 2);

      for (let innerCircle = 0; innerCircle < innerCircles; innerCircle++) {
        const innerCircleDifference = 0.1;
        const innerCircleScale = scale * (1 - innerCircleDifference);
        const innerCircleYTranslation =
          yOffset + r * scale * innerCircleDifference;

        const innerCircleMat = ShaderUtils.mult2dMats(circleMat, [
          ShaderUtils.init2dTranslationMat(xOffset, innerCircleYTranslation),
          ShaderUtils.init2dScaleMat(innerCircleScale, innerCircleScale),
        ]);

        this.gl.uniformMatrix3fv(locations.mat, false, innerCircleMat);
        this.gl.uniform3f(locations.color, 1, 0, 0);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, verticesCount - 2);
      }
    }
  }

  renderScene(timeNow) {
    super.renderScene(timeNow);

    this.#renderCircles();
  }
}
