import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Circle from "../Shapes/2d/Circle.js";

export default class CircleGrid extends Shader {
  constructor(shaders) {
    super();

    this.#grid.centerCircle.mat = ShaderUtils.mult2dMats(
      this.projectionMat,
      this.#grid.centerCircle.shape.mat
    );

    this.initShaders(shaders).then(([circle]) => {
      this.#grid.circleProgram = circle;

      this.#initLocations();
      this.#initObjectsData();

      this.requestAnimationFrame();
    });
  }

  #locations;

  #grid = (() => {
    const centerCircleR = 300;
    const centerCircleVertices = 100;
    const centerCircle = new Circle(
      this.gl.canvas.width / 2,
      this.gl.canvas.height / 2,
      centerCircleR,
      Math.PI * 2,
      centerCircleVertices
    );

    const circumferenceCirclesCount = 4;
    const circumferenceCircle = new Circle(
      this.gl.canvas.width / 2,
      this.gl.canvas.height / 2,
      centerCircleR / 2,
      Math.PI / 2,
      centerCircleVertices
    );

    const innerCircle = new Circle(
      this.gl.canvas.width / 2,
      this.gl.canvas.height / 2,
      centerCircleR / 2,
      Math.PI * 2,
      centerCircleVertices
    );

    const innerCircles = 32;

    return {
      centerCircle: {
        shape: centerCircle,
      },
      circumferenceCircles: {
        shape: circumferenceCircle,
        count: circumferenceCirclesCount,
        positionAngleStep: (Math.PI * 2) / circumferenceCirclesCount,
        positionCircleR: centerCircleR,
      },
      innerCircles: {
        shape: innerCircle,
        count: innerCircles,
        positionAngleStep: (Math.PI * 2) / innerCircles,
        positionCircleR: centerCircleR / 2,
      },
    };
  })();

  #initLocations() {
    this.#locations = {
      position: this.gl.getAttribLocation(
        this.#grid.circleProgram,
        "a_position"
      ),
      mat: this.gl.getUniformLocation(this.#grid.circleProgram, "u_mat"),
      color: this.gl.getUniformLocation(this.#grid.circleProgram, "u_color"),
    };
  }

  #initObjectsData() {
    this.#grid.centerCircle.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.#grid.centerCircle.vao);

    this.#grid.centerCircle.buffer = this.createAndBindVerticesBuffer(
      this.#locations.position,
      this.#grid.centerCircle.shape.coordinates,
      { size: 2 }
    );

    this.#grid.circumferenceCircles.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.#grid.circumferenceCircles.vao);

    this.#grid.circumferenceCircles.buffer = this.createAndBindVerticesBuffer(
      this.#locations.position,
      this.#grid.circumferenceCircles.shape.coordinates,
      { size: 2 }
    );

    this.#grid.innerCircles.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.#grid.innerCircles.vao);

    this.#grid.innerCircles.buffer = this.createAndBindVerticesBuffer(
      this.#locations.position,
      this.#grid.innerCircles.shape.coordinates,
      { size: 2 }
    );
  }

  #renderCenterCircle() {
    this.gl.bindVertexArray(this.#grid.centerCircle.vao);
    this.gl.uniform3f(this.#locations.color, 0, 0, 1);

    this.gl.uniformMatrix3fv(
      this.#locations.mat,
      false,
      this.#grid.centerCircle.mat
    );

    this.gl.drawArrays(
      this.gl.LINE_STRIP,
      0,
      this.#grid.centerCircle.shape.verticesCount + 1
    );
  }

  #renderCircumferenceCircles() {
    this.gl.bindVertexArray(this.#grid.circumferenceCircles.vao);
    this.gl.uniform3f(this.#locations.color, 0, 0, 1);

    const { count, positionAngleStep, positionCircleR } =
      this.#grid.circumferenceCircles;

    for (
      let circle = 0, positionAngle = -Math.PI / 4 -  Math.PI / 2;
      circle < count;
      positionAngle += positionAngleStep, circle++
    ) {
      const x = Math.cos(positionAngle) * positionCircleR;
      const y = Math.sin(positionAngle) * positionCircleR;

      const circleMat = ShaderUtils.mult2dMats(this.#grid.centerCircle.mat, [
        ShaderUtils.init2dTranslationMat(x, y),
        ShaderUtils.init2dRotationMat(circle * (-Math.PI / 2)),
      ]);

      this.gl.uniformMatrix3fv(this.#locations.mat, false, circleMat);

      this.gl.drawArrays(
        this.gl.LINE_STRIP,
        0,
        this.#grid.circumferenceCircles.shape.verticesCount + 1
      );
    }
  }

  #renderInnerCircles() {
    this.gl.bindVertexArray(this.#grid.innerCircles.vao);
    this.gl.uniform3f(this.#locations.color, 0, 0, 1);

    const { count, positionAngleStep, positionCircleR } =
      this.#grid.innerCircles;

    for (
      let circle = 0, positionAngle = 0; // -Math.PI / 2
      circle < count;
      positionAngle += positionAngleStep, circle++
    ) {
      const x = Math.cos(positionAngle) * positionCircleR;
      const y = Math.sin(positionAngle) * positionCircleR;

      const circleMat = ShaderUtils.mult2dMats(this.#grid.centerCircle.mat, [
        ShaderUtils.init2dTranslationMat(x, y),
        // ShaderUtils.init2dRotationMat(circle * (-Math.PI / 4)),
      ]);

      this.gl.uniformMatrix3fv(this.#locations.mat, false, circleMat);

      this.gl.drawArrays(
        this.gl.LINE_STRIP,
        0,
        this.#grid.innerCircles.shape.verticesCount + 1
      );
    }
  }

  //   #renderGrid() {}

  renderScene(timeNow) {
    super.renderScene(timeNow);

    const { deltaTime } = this.animData;

    this.gl.useProgram(this.#grid.circleProgram);

    // this.#renderCenterCircle();
    this.#renderCircumferenceCircles();
    // this.#renderInnerCircles();

    // this.requestAnimationFrame();
  }
}

