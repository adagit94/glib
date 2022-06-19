import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Ellipse from "../Shapes/Ellipse.js";
import Circle from "../Shapes/Circle.js";

export default class Light extends Shader {
  constructor(shaders) {
    super();

    this.initShaders(shaders).then(([light]) => {
      this.#program = light;

      this.#initLocations();
      this.#initObjectsData();

      this.#initEffects();

      this.requestAnimationFrame();
    });
  }

  #program;
  #locations;

  #radial;
  #radialQuad;
  #ellipticQuad;
  #triangularStar;
  #triangular;

  #effects;

  #animate = true;

  #initLocations() {
    this.#locations = {
      position: this.gl.getAttribLocation(this.#program, "a_position"),
      mat: this.gl.getUniformLocation(this.#program, "u_mat"),
      lightness: this.gl.getUniformLocation(this.#program, "u_lightness"),
      zIndex: this.gl.getUniformLocation(this.#program, "u_zIndex"),
    };
  }

  #initObjectsData() {
    this.#initRadialLightData();
    this.#initRadialQuadData();
    this.#initEllipticQuadData();
    this.#initTriangularStarData();
    this.#initTriangleLines();
  }

  #initEffects() {
    this.#effects = {
      pendulumTick: (() => {
        let trianglesLightness = [];

        return (triangle, lightness, side) => {
          const { triangles, mode } = this.#triangular;

          trianglesLightness[triangle] = lightness;

          const fullTick =
            trianglesLightness.length === triangles &&
            trianglesLightness.every((lightness) => lightness <= 0);

          if (fullTick) {
            if (
              (mode[1].side === "both" && side === "right") ||
              mode[1].side !== "both"
            ) {
              mode[1].direction =
                mode[1].direction === "forwards" ? "backwards" : "forwards";

              mode[1].triggerDimming = false;

              this.animData.deltaTime = 0;
            }

            trianglesLightness = [];

            return true;
          }

          return false;
        };
      })(),
      pulsingLightness: (lightness, anim, lastShapeReached) => {
        const t = this.animData.deltaTime / 2 - anim.borderDeltaT;

        switch (anim.direction) {
          case "inward":
            lightness -= t;

            if (lastShapeReached && lightness <= 0) {
              anim.direction = "outward";
              anim.borderDeltaT = t;
            }
            break;

          case "outward":
            lightness -= anim.borderDeltaT - t;

            if (lastShapeReached && lightness >= 1) {
              anim.direction = "inward";
              this.animData.deltaTime = 0;
              anim.borderDeltaT = 0;
            }
            break;
        }

        return lightness;
      },
      fluidLayers: (shapesCount, anim) => {
        const { op, firstTriangle } = anim;
        const t = Math.round(this.animData.deltaTime * 160);
        let newCount;

        switch (op) {
          case "subtract":
            newCount = Math.max(firstTriangle, shapesCount - t);
            break;

          case "add":
            newCount = Math.min(shapesCount, firstTriangle + t);

            console.log("add", newCount);
            break;
        }

        if (
          (anim.op === "subtract" && newCount === firstTriangle) ||
          (anim.op === "add" && newCount === shapesCount)
        ) {
          this.animData.deltaTime = 0;
          anim.op = anim.op === "subtract" ? "add" : "subtract";
        }

        return newCount;
      },
    };
  }

  #initRadialLightData() {
    const vao = this.gl.createVertexArray();
    const ellipse = new Ellipse(
      this.gl.canvas.width / 2,
      this.gl.canvas.height,
      this.gl.canvas.width / 2,
      this.gl.canvas.height,
      -Math.PI,
      1000
    );

    this.gl.bindVertexArray(vao);

    this.#radial = {
      vao,
      ellipse,
      count: 10000,
      mat: ShaderUtils.mult2dMats(this.projectionMat, ellipse.mat),
      buffer: this.createAndBindVerticesBuffer(
        this.#locations.position,
        ellipse.coordinates,
        { size: 2 }
      ),
      anim: { direction: "inward", borderDeltaT: 0 },
    };
  }

  #renderRadialLight() {
    this.gl.bindVertexArray(this.#radial.vao);

    const rScaleStep = 1 / this.#radial.count;
    const lightnessStep = 1 / this.#radial.count;

    for (
      let ellipse = 0, rScale = 1, lightness = lightnessStep;
      ellipse < this.#radial.count;
      rScale -= rScaleStep, lightness += lightnessStep, ellipse++
    ) {
      const mat = ShaderUtils.mult2dMats(
        this.#radial.mat,
        ShaderUtils.init2dScaleMat(rScale, rScale)
      );

      let l = lightness;

      if (this.#animate) {
        l = this.#effects.pulsingLightness(
          l,
          this.#radial.anim,
          ellipse === this.#radial.count - 1
        );
      }

      this.gl.uniformMatrix3fv(this.#locations.mat, false, mat);
      this.gl.uniform1f(this.#locations.lightness, l);
      this.gl.drawArrays(
        this.gl.LINE_STRIP,
        0,
        this.#radial.ellipse.verticesCount + 1
      );
    }
  }

  #initRadialQuadData() {
    const vao = this.gl.createVertexArray();
    const circle = new Circle(
      this.gl.canvas.width / 2,
      this.gl.canvas.height / 2,
      this.gl.canvas.width / 4,
      2 * Math.PI,
      100
    );

    this.gl.bindVertexArray(vao);

    this.#radialQuad = {
      vao,
      circle,
      count: 5000,
      mat: ShaderUtils.mult2dMats(this.projectionMat, circle.mat),
      directions: 4,
      translations: [
        {
          x: 0,
          y: this.gl.canvas.height / 2,
        },
        {
          x: 0,
          y: -this.gl.canvas.height / 2,
        },
        {
          x: -this.gl.canvas.width / 2,
          y: 0,
        },
        {
          x: this.gl.canvas.width / 2,
          y: 0,
        },
      ],
      buffer: this.createAndBindVerticesBuffer(
        this.#locations.position,
        circle.coordinates,
        { size: 2 }
      ),
      anim: { direction: "inward", borderDeltaT: 0 },
    };
  }

  #renderRadialQuad() {
    const { anim, count, vao, directions, translations } = this.#radialQuad;

    const rScaleStep = 1 / count;
    const lightnessStep = 1 / count;

    this.gl.bindVertexArray(vao);

    for (let direction = 0; direction < directions; direction++) {
      for (
        let circle = 0, rScale = 1, lightness = lightnessStep;
        circle < count;
        rScale -= rScaleStep, lightness += lightnessStep, circle++
      ) {
        const { x, y } = translations[direction];
        const mat = ShaderUtils.mult2dMats(this.#radialQuad.mat, [
          ShaderUtils.init2dTranslationMat(x, y),
          ShaderUtils.init2dScaleMat(rScale, rScale),
        ]);

        let l = lightness;

        if (this.#animate) {
          l = this.#effects.pulsingLightness(
            l,
            anim,
            direction === directions - 1 && circle === count - 1
          );
        }

        this.gl.uniformMatrix3fv(this.#locations.mat, false, mat);
        this.gl.uniform1f(this.#locations.lightness, l);
        this.gl.drawArrays(
          this.gl.LINE_STRIP,
          0,
          this.#radialQuad.circle.verticesCount + 1
        );
      }
    }
  }

  #initTriangularStarData() {
    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    const squareLength = this.gl.canvas.height / 3;
    const squares = 8;
    const squareRotationStep = Math.PI / 2 / squares;

    const coords = new Float32Array([
      // SQUARE
      -squareLength / 2,
      -squareLength / 2,

      -squareLength / 2,
      squareLength / 2,

      squareLength / 2,
      squareLength / 2,

      squareLength / 2,
      -squareLength / 2,

      // TRIANGLE POINTS
      -squareLength * 1.5,
      0,

      0,
      squareLength * 1.5,

      squareLength * 1.5,
      0,

      0,
      -squareLength * 1.5,
    ]);

    const indices = new Uint16Array([
      0, 1, 3, 2, 3, 1, 0, 1, 4, 1, 2, 5, 2, 3, 6, 3, 0, 7,
    ]);

    const centerMat = ShaderUtils.mult2dMats(
      this.projectionMat,
      ShaderUtils.init2dTranslationMat(
        this.gl.canvas.width / 2,
        this.gl.canvas.height / 2
      )
    );

    let squareMats = [centerMat];

    for (
      let square = 1, rotation = squareRotationStep;
      square < squares;
      rotation += squareRotationStep, square++
    ) {
      squareMats.push(
        ShaderUtils.mult2dMats(
          centerMat,
          ShaderUtils.init2dRotationMat(rotation)
        )
      );
    }

    this.#triangularStar = {
      squares,
      vao,
      mats: {
        squares: squareMats,
      },
      trianglesCount: 100,
      invertLightness: false,
      buffers: {
        vertex: this.createAndBindVerticesBuffer(
          this.#locations.position,
          coords,
          { size: 2 }
        ),
        index: this.createAndBindElementsBuffer(indices, this.gl.STATIC_READ),
      },
      anim: {
        active: "fluidLayers",
        pulsingLightness: { direction: "inward", borderDeltaT: 0 },
        fluidLayers: { firstTriangle: 9, op: "subtract" },
      },
    };
  }

  #renderTriangularStar() {
    const { anim, vao, mats, squares, buffers, invertLightness } =
      this.#triangularStar;

    let { trianglesCount } = this.#triangularStar;

    if (this.#animate) {
      if (anim.active === "fluidLayers") {
        trianglesCount = this.#effects.fluidLayers(
          trianglesCount,
          anim.fluidLayers
        );
      }
    }

    // console.log("trianglesCount", trianglesCount)

    const scaleStep = 1 / trianglesCount;
    const lightnessStep = 1 / trianglesCount;

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(invertLightness ? this.gl.LESS : this.gl.GREATER);
    this.gl.clearDepth(0);
    if (!invertLightness) this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

    this.gl.bindVertexArray(vao);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    for (let square = 0; square < squares; square++) {
      for (let side = 0; side < 4; side++) {
        for (
          let triangle = 0,
            scale = 1,
            lightness = invertLightness ? 1 : lightnessStep;
          triangle < trianglesCount;
          scale -= scaleStep,
            lightness = invertLightness
              ? lightness - lightnessStep * 4
              : lightness + lightnessStep,
            triangle++
        ) {
          const triangleMat = ShaderUtils.mult2dMats(
            mats.squares[square],
            ShaderUtils.init2dScaleMat(scale, scale)
          );

          let l = lightness;

          if (this.#animate) {
            if (anim.active === "pulsingLightness") {
              l = this.#effects.pulsingLightness(
                l,
                anim.pulsingLightness,
                side === 3 && triangle === trianglesCount - 1
              );
            }
          }

          this.gl.uniformMatrix3fv(this.#locations.mat, false, triangleMat);

          this.gl.uniform1f(this.#locations.lightness, l);
          this.gl.uniform1f(this.#locations.zIndex, l);

          this.gl.drawElements(this.gl.TRIANGLES, 3, this.gl.UNSIGNED_SHORT, 0);
          this.gl.drawElements(
            this.gl.TRIANGLES,
            3,
            this.gl.UNSIGNED_SHORT,
            3 * 2
          );

          this.gl.drawElements(
            this.gl.TRIANGLES,
            3,
            this.gl.UNSIGNED_SHORT,
            (6 + side * 3) * 2
          );
        }
      }
    }
  }

  #initEllipticQuadData() {
    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    const directions = 4;
    const rx = this.gl.canvas.width / 4;
    const ry = this.gl.canvas.height / 2 - 4;
    const ellipse = new Ellipse(
      0,
      this.gl.canvas.height / 2,
      rx,
      ry,
      Math.PI * 2,
      1000
    );

    const ellipseMat = ShaderUtils.mult2dMats(this.projectionMat, ellipse.mat);

    this.#ellipticQuad = {
      vao,
      ellipse,
      horizontalScaleToAdd:
        (rx - Math.cos(Math.PI / 4) * rx) / (this.gl.canvas.width / 2),
      countPerEllipse: 750,
      directions,
      mats: [
        ellipseMat,
        ShaderUtils.mult2dMats(ellipseMat, [
          ShaderUtils.init2dTranslationMat(this.gl.canvas.width, 0),
        ]),
        ShaderUtils.mult2dMats(ellipseMat, [
          ShaderUtils.init2dTranslationMat(
            this.gl.canvas.width / 2,
            -this.gl.canvas.height / 2
          ),
        ]),
        ShaderUtils.mult2dMats(ellipseMat, [
          ShaderUtils.init2dTranslationMat(
            this.gl.canvas.width / 2,
            this.gl.canvas.height / 2
          ),
        ]),
      ],
      buffer: this.createAndBindVerticesBuffer(
        this.#locations.position,
        ellipse.coordinates,
        { size: 2 }
      ),
      anim: { direction: "inward", borderDeltaT: 0 },
    };
  }

  #renderEllipticQuad() {
    const {
      anim,
      countPerEllipse,
      vao,
      directions,
      mats,
      horizontalScaleToAdd,
    } = this.#ellipticQuad;

    const rScaleStep = 1 / countPerEllipse;
    const lightnessStep = 1 / countPerEllipse;

    this.gl.bindVertexArray(vao);

    for (let direction = 0; direction < directions; direction++) {
      const baseMat = mats[direction];

      for (
        let ellipse = 0, rScale = 1, lightness = lightnessStep;
        ellipse < countPerEllipse;
        rScale -= rScaleStep, lightness += lightnessStep, ellipse++
      ) {
        const scaledEllipseMat = ShaderUtils.mult2dMats(
          baseMat,
          ShaderUtils.init2dScaleMat(rScale + horizontalScaleToAdd, rScale)
        );
        let l = lightness;

        if (this.#animate) {
          l = this.#effects.pulsingLightness(
            l,
            anim,
            direction === directions - 1 && ellipse === countPerEllipse - 1
          );
        }

        this.gl.uniformMatrix3fv(this.#locations.mat, false, scaledEllipseMat);
        this.gl.uniform1f(this.#locations.lightness, l);
        this.gl.drawArrays(
          this.gl.LINE_STRIP,
          0,
          this.#ellipticQuad.ellipse.verticesCount + 1
        );
      }
    }
  }

  #initTriangleLines() {
    const triangles = 256; // 256
    const vertices = triangles + 1;
    const sideCount = triangles / 2;

    const widthStep = this.gl.canvas.width / sideCount;
    const heightStep = this.gl.canvas.height / sideCount;

    let leftSideCoordinates = [0, this.gl.canvas.height];
    let rightSideCoordinates = [this.gl.canvas.width, this.gl.canvas.height];

    let leftIndices = [];
    let rightIndices = [];

    for (
      let vertex = 0, x = this.gl.canvas.width, y = this.gl.canvas.height;
      vertex < vertices;
      vertex++
    ) {
      leftSideCoordinates.push(x, y);

      if (vertex > 1) {
        leftIndices.push(vertex, vertex - 1, 0);
      }

      if (vertex < sideCount) {
        y -= heightStep;
      }

      if (vertex >= sideCount) {
        x -= widthStep;
      }
    }

    leftIndices.push(vertices, vertices - 1, 0);

    for (
      let vertex = 0, x = 0, y = this.gl.canvas.height;
      vertex < vertices;
      vertex++
    ) {
      rightSideCoordinates.push(x, y);

      if (vertex > 1) {
        rightIndices.push(vertex, vertex - 1, 0);
      }

      if (vertex < sideCount) {
        y -= heightStep;
      }

      if (vertex >= sideCount) {
        x += widthStep;
      }
    }

    rightIndices.push(vertices, vertices - 1, 0);

    leftSideCoordinates = new Float32Array(leftSideCoordinates);
    rightSideCoordinates = new Float32Array(rightSideCoordinates);

    leftIndices = new Uint16Array(leftIndices);
    rightIndices = new Uint16Array(rightIndices);

    const leftSideVao = this.gl.createVertexArray();

    this.gl.bindVertexArray(leftSideVao);

    const leftVertexBuffer = this.createAndBindVerticesBuffer(
      this.#locations.position,
      leftSideCoordinates,
      { size: 2 },
      this.gl.STATIC_READ
    );

    const leftIndexBuffer = this.createAndBindElementsBuffer(
      leftIndices,
      this.gl.STATIC_READ
    );

    const rightSideVao = this.gl.createVertexArray();

    this.gl.bindVertexArray(rightSideVao);

    const rightVertexBuffer = this.createAndBindVerticesBuffer(
      this.#locations.position,
      rightSideCoordinates,
      { size: 2 },
      this.gl.STATIC_READ
    );

    const rightIndexBuffer = this.createAndBindElementsBuffer(
      rightIndices,
      this.gl.STATIC_READ
    );

    const tPercMult = 5;

    this.#triangular = {
      vaos: { left: leftSideVao, right: rightSideVao },
      lines: vertices,
      coordinates: leftSideCoordinates,
      indices: leftIndices,
      triangles,
      lightnessStep: 0.5 / (triangles - 1),
      // lightnessStep: 1 / (triangles - 1),
      mat: this.projectionMat,
      mode: [
        "pendulum", // forwards, backwards, pendulum
        {
          direction: "backwards",
          frontTriangle: undefined,
          triggerDimming: false,
          lightnessMult: (0.5 / 100) * tPercMult,
          // lightnessMult: (1 / 100) * tPercMult,
          triangleMult: (triangles / 100) * tPercMult,
          side: "both",
        },
      ],
      buffers: {
        vertices: {
          left: leftVertexBuffer,
          right: rightVertexBuffer,
        },
        indices: {
          left: leftIndexBuffer,
          right: rightIndexBuffer,
        },
      },
    };
  }

  #renderTriangles() {
    const { mode } = this.#triangular;

    this.gl.uniformMatrix3fv(this.#locations.mat, false, this.#triangular.mat);

    switch (mode[0]) {
      case "forwards":
        this.#renderTrianglesForwards(mode[1].side);
        break;

      case "backwards":
        this.#renderTrianglesBackwards(mode[1].side);
        break;

      case "pendulum":
        switch (mode[1].side) {
          case "both":
            this.#renderTrianglesPendulum("left");
            this.#renderTrianglesPendulum("right");
            break;

          default:
            this.#renderTrianglesPendulum(mode[1].side);
        }
    }
  }

  #renderTrianglesForwards(side) {
    const { triangles, lightnessStep } = this.#triangular;

    this.gl.bindVertexArray(this.#triangular.vaos[side]);
    this.gl.bindBuffer(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.#triangular.buffers.indices[side]
    );

    // console.log("renderTrianglesForwards", renderTrianglesForwards);

    for (
      let triangle = 0, lightness = 0;
      triangle < triangles;
      lightness += lightnessStep, triangle++
    ) {
      let lightnessVal = lightness;

      if (this.#animate) {
        lightnessVal -= this.animData.deltaTime / 10; // 1.25
      }

      this.gl.uniform1f(this.#locations.lightness, lightnessVal);

      this.gl.drawElements(
        this.gl.TRIANGLES,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );
    }
  }

  #renderTrianglesBackwards(side) {
    const { triangles, lightnessStep } = this.#triangular;

    this.gl.bindVertexArray(this.#triangular.vaos[side]);
    this.gl.bindBuffer(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.#triangular.buffers.indices[side]
    );

    for (
      let triangle = 0, lightness = 1;
      triangle < triangles;
      lightness -= lightnessStep, triangle++
    ) {
      let lightnessVal = lightness;

      if (this.#animate) {
        lightnessVal -= this.animData.deltaTime / 10; // 1.25
      }

      this.gl.uniform1f(this.#locations.lightness, lightnessVal);

      this.gl.drawElements(
        this.gl.TRIANGLES,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );
    }
  }

  #renderTrianglesPendulum(side) {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.DST_COLOR);
    this.gl.disable(this.gl.DEPTH_TEST);

    const { triangles, mode, lightnessStep } = this.#triangular;
    const {
      direction,
      triggerDimming,
      triangleMult,
      lightnessMult,
      side: confSide,
    } = mode[1];

    if (!triggerDimming) {
      const roundedT = Math.round(this.animData.deltaTime * triangleMult);

      let frontTriangle =
        direction === "forwards" ? 0 + roundedT : triangles - 1 - roundedT;

      switch (direction) {
        case "forwards": {
          const remainingTriangles = triangles - 1 - frontTriangle;

          if (remainingTriangles < 0) {
            frontTriangle = triangles - 1;
          }
          break;
        }

        case "backwards": {
          if (frontTriangle < 0) frontTriangle = 0;
          break;
        }
      }

      mode[1].frontTriangle = frontTriangle;
    }

    let { frontTriangle } = mode[1];

    this.gl.bindVertexArray(this.#triangular.vaos[side]);
    this.gl.bindBuffer(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.#triangular.buffers.indices[side]
    );

    for (let triangle = 0; triangle < triangles; triangle++) {
      let lightness;

      if (triangle === frontTriangle) {
        lightness = 0.5;
      } else if (
        (direction === "forwards" && triangle > frontTriangle) ||
        (direction === "backwards" && triangle < frontTriangle)
      ) {
        lightness = 0;
      } else if (
        (direction === "forwards" && triangle < frontTriangle) ||
        (direction === "backwards" && triangle > frontTriangle)
      ) {
        const triangleStepsFromFront =
          direction === "backwards"
            ? triangle - frontTriangle
            : frontTriangle - triangle;

        lightness = 0.5 - triangleStepsFromFront * lightnessStep;
      }

      if (triggerDimming) {
        lightness -= this.animData.deltaTime * lightnessMult;
      }

      this.gl.uniform1f(this.#locations.lightness, lightness);

      this.gl.drawElements(
        this.gl.TRIANGLES,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );

      if (
        triggerDimming &&
        this.#effects.pendulumTick(triangle, lightness, side)
      )
        return;
    }

    if (!triggerDimming) {
      switch (direction) {
        case "forwards":
          if (
            frontTriangle === triangles - 1 &&
            ((confSide === "both" && side === "right") || confSide !== "both")
          ) {
            this.animData.deltaTime = 0;

            mode[1].triggerDimming = true;
          }
          break;

        case "backwards":
          if (
            frontTriangle === 0 &&
            ((confSide === "both" && side === "right") || confSide !== "both")
          ) {
            this.animData.deltaTime = 0;

            mode[1].triggerDimming = true;
          }
          break;
      }
    }
  }

  // #renderTrianglesPendulum(side) {
  //   const { triangles, mode, lightnessStep } = this.#triangular;
  //   const {
  //     direction,
  //     triggerDimming,
  //     triangleMult,
  //     lightnessMult,
  //     side: confSide,
  //   } = mode[1];

  //   if (!triggerDimming) {
  //     const roundedT = Math.round(this.animData.deltaTime * triangleMult);

  //     let frontTriangle =
  //       direction === "forwards" ? 0 + roundedT : triangles - 1 - roundedT;

  //     switch (direction) {
  //       case "forwards": {
  //         const remainingTriangles = triangles - 1 - frontTriangle;

  //         if (remainingTriangles < 0) {
  //           frontTriangle = triangles - 1;
  //         }
  //         break;
  //       }

  //       case "backwards": {
  //         if (frontTriangle < 0) frontTriangle = 0;
  //         break;
  //       }
  //     }

  //     mode[1].frontTriangle = frontTriangle;
  //   }

  //   let { frontTriangle } = mode[1];

  //   this.gl.bindVertexArray(this.#triangular.vaos[side]);
  //   this.gl.bindBuffer(
  //     this.gl.ELEMENT_ARRAY_BUFFER,
  //     this.#triangular.buffers.indices[side]
  //   );

  //   for (let triangle = 0; triangle < triangles; triangle++) {
  //     let lightness;

  //     if (triangle === frontTriangle) {
  //       lightness = 1;
  //     } else if (
  //       (direction === "forwards" && triangle > frontTriangle) ||
  //       (direction === "backwards" && triangle < frontTriangle)
  //     ) {
  //       lightness = 0;
  //     } else if (
  //       (direction === "forwards" && triangle < frontTriangle) ||
  //       (direction === "backwards" && triangle > frontTriangle)
  //     ) {
  //       const triangleStepsFromFront =
  //         direction === "backwards"
  //           ? triangle - frontTriangle
  //           : frontTriangle - triangle;

  //       lightness = 1 - triangleStepsFromFront * lightnessStep;
  //     }

  //     if (triggerDimming) {
  //       lightness -= this.animData.deltaTime * lightnessMult;
  //     }

  //     this.gl.uniform1f(this.#locations.lightness, lightness);

  //     this.gl.drawElements(
  //       this.gl.TRIANGLES,
  //       3,
  //       this.gl.UNSIGNED_SHORT,
  //       triangle * 3 * 2
  //     );

  //     if (triggerDimming && this.#effects.pendulumTick(triangle, lightness)) return;
  //   }

  //   if (!triggerDimming) {
  //     switch (direction) {
  //       case "forwards":
  //         if (
  //           frontTriangle === triangles - 1 &&
  //           ((confSide === "both" && side === "right") || confSide !== "both")
  //         ) {
  //           this.animData.deltaTime = 0;

  //           mode[1].triggerDimming = true;
  //         }
  //         break;

  //       case "backwards":
  //         if (
  //           frontTriangle === 0 &&
  //           ((confSide === "both" && side === "right") || confSide !== "both")
  //         ) {
  //           this.animData.deltaTime = 0;

  //           mode[1].triggerDimming = true;
  //         }
  //         break;
  //     }
  //   }
  // }

  renderScene(timeNow) {
    super.renderScene(timeNow);

    this.gl.useProgram(this.#program);

    // this.#renderRadialLight();
    // this.#renderRadialQuad();
    // this.#renderEllipticQuad();
    this.#renderTriangularStar();
    // this.#renderTriangles();

    if (this.#animate) this.requestAnimationFrame();
  }
}
