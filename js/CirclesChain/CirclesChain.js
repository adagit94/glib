import Shader from "../Shader/Shader.js";
import Circle from "../Shapes/Circle.js";
import ShaderUtils from "../Shader/ShaderUtils.js";

export default class CirclesChain extends Shader {
  constructor(shaders) {
    super();

    this.initShaders(shaders).then((programs) => {
      const [circle] = programs;

      this.#circles.program = circle;

      this.#initLocations(programs);
      this.#initObjectsData();

      this.requestAnimationFrame();
    });
  }

  #chain = {};
  #circles = {};

  #initLocations(programs) {
    const locations = this.initCommonLocations(programs);

    this.#circles.locations = {
      ...locations[0],
      color: this.gl.getUniformLocation(this.#circles.program, "u_color"),
    };
  }

  #initObjectsData() {
    this.#initCirclesData();
  }

  #initCirclesData() {
    const vao = this.gl.createVertexArray();

    const r = (this.gl.canvas.width + this.gl.canvas.height) / 2 / 20;
    const circle = new Circle(0, this.gl.canvas.height, r, Math.PI * 2, 100);

    this.gl.bindVertexArray(vao);

    this.#circles.vao = vao;
    this.#circles.verticesCount = circle.coordinates.length / 2;
    this.#circles.circle = circle;
    this.#circles.circles = [
      { color: [0, 0, 1] },
      { color: [0, 1, 0] },
      { color: [1, 0, 0] },
    ];
    this.#circles.r = r;
    this.#circles.spacing = {
      x: (this.gl.canvas.width / 100) * 15,
      y: (this.gl.canvas.height / 100) * 15,
    };
    this.#circles.mat = ShaderUtils.mult2dMats(this.projectionMat, circle.mat);
    this.#circles.buffers = {
      vertex: this.createAndBindVerticesBuffer(
        this.#circles.locations.pos,
        circle.coordinates,
        { size: 2 }
      ),
    };
    this.#circles.offset = { step: 30 };
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
      circles,
      offset,
    } = this.#circles;

    this.gl.useProgram(program);
    this.gl.bindVertexArray(vao);

    for (
      let xOffset = r, yOffset = -r, scale = 1, offsetMult = 6;
      xOffset + r * scale < this.gl.canvas.width &&
      (yOffset - r * scale) * -1 < this.gl.canvas.height;
      xOffset +=
        spacing.x - (xOffset / this.gl.canvas.width) * Math.pow(offsetMult, 2),
        yOffset -=
          spacing.y -
          ((yOffset * -1) / this.gl.canvas.height) * Math.pow(offsetMult, 2),
        scale =
          1 -
          (xOffset / this.gl.canvas.width +
            (yOffset * -1) / this.gl.canvas.height) /
            2,
        offsetMult += 1
    ) {
      for (let circle = 0; circle < circles.length; circle++) {
        const circleData = circles[circle];
        const circleDifference = 0.1 * circle;
        const circleScale = scale * (1 - circleDifference);
        const circleYTranslation = yOffset + r * scale * circleDifference;

        const innerCircleMat = ShaderUtils.mult2dMats(circleMat, [
          ShaderUtils.init2dTranslationMat(xOffset, circleYTranslation),
          ShaderUtils.init2dScaleMat(circleScale, circleScale),
        ]);

        this.gl.uniformMatrix3fv(locations.mat, false, innerCircleMat);
        this.gl.uniform3f(locations.color, ...circleData.color);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, verticesCount - 2);
      }
    }
  }

  renderScene(timeNow) {
    super.renderScene(timeNow);

    this.#renderCircles();
  }
}
