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

      this.animate = true;

      this.requestAnimationFrame();
    });
  }

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

    const yLimitBase = -25;

    this.gl.bindVertexArray(vao);

    this.#circles.vao = vao;
    this.#circles.verticesCount = circle.coordinates.length / 2;
    this.#circles.circle = circle;
    this.#circles.circles = [
      { color: [0, 0, 1] },
      { color: [0, 1, 0] },
      { color: [1, 0, 0] },
    ];
    this.#circles.anims = {
      yTranslation: {
        active: true,
        direction: "down",
        limitBase: yLimitBase,
        limitAdditionFactor: ((yLimitBase * -1) / 100) * 10,
        groups: [],
      },
    };
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
      anims,
    } = this.#circles;

    this.gl.useProgram(program);
    this.gl.bindVertexArray(vao);

    for (
      let grp = 0, xOffset = r, yOffset = -r, scale = 1, offsetMult = 5;
      xOffset + r * scale < this.gl.canvas.width &&
      (yOffset - r * scale) * -1 < this.gl.canvas.height;
      grp++,
        xOffset +=
          spacing.x -
          (xOffset / this.gl.canvas.width) * Math.pow(offsetMult, 2),
        yOffset -=
          spacing.y -
          ((yOffset * -1) / this.gl.canvas.height) * Math.pow(offsetMult, 2),
        scale =
          1 -
          (xOffset / this.gl.canvas.width +
            (yOffset * -1) / this.gl.canvas.height) /
            2,
        offsetMult += 1.1
    ) {
      let circlesGroupMat = circleMat;

      if (this.animate && anims.yTranslation.active) {
        let circlesGroup = anims.yTranslation.groups[grp];

        if (!circlesGroup) {
          circlesGroup = anims.yTranslation.groups[grp] = { y: 0 };
        }

        const limit =
          anims.yTranslation.limitBase +
          anims.yTranslation.limitAdditionFactor * grp;

        const translationSpeed = ((limit * -1) / 100) * 1;

        if (circlesGroup.y >= 0) {
          anims.yTranslation.direction = "down";
        } else if (circlesGroup.y <= limit) {
          anims.yTranslation.direction = "up";
        }

        switch (anims.yTranslation.direction) {
          case "up":
            circlesGroup.y += translationSpeed;
            break;

          case "down":
            circlesGroup.y -= translationSpeed;
            break;
        }

        circlesGroupMat = ShaderUtils.mult2dMats(
          circlesGroupMat,
          ShaderUtils.init2dTranslationMat(0, circlesGroup.y)
        );
      }

      for (let circle = 0; circle < circles.length; circle++) {
        const circleData = circles[circle];
        const circleDifference = 0.1 * circle;
        const circleScale = scale * (1 - circleDifference);
        const circleYTranslation = yOffset + r * scale * circleDifference;

        const innerCircleMat = ShaderUtils.mult2dMats(circlesGroupMat, [
          ShaderUtils.init2dTranslationMat(xOffset, circleYTranslation),
          ShaderUtils.init2dScaleMat(circleScale, circleScale),
        ]);

        this.gl.uniformMatrix3fv(locations.mat, false, innerCircleMat);
        this.gl.uniform3f(locations.color, ...circleData.color);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, verticesCount - 2);
      }
    }
  }

  computeScene() {
    this.#renderCircles();
  }
}
