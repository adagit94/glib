import Shader from '../Shader/Shader.js';
import ShaderUtils from '../Shader/ShaderUtils.js';
import Ellipse from '../Shapes/Ellipse.js';
import Circle from '../Shapes/Circle.js';
import PulsingUtils from './PulsingUtils.js';

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

  #animate = false;

  #initLocations() {
    this.#locations = {
      position: this.gl.getAttribLocation(this.#program, 'a_position'),
      mat: this.gl.getUniformLocation(this.#program, 'u_mat'),
      lightness: this.gl.getUniformLocation(this.#program, 'u_lightness'),
      zIndex: this.gl.getUniformLocation(this.#program, 'u_zIndex'),
    };
  }

  #initObjectsData() {
    // ellipse
    // {
    //       x: this.gl.canvas.width / 2,
    //       y: this.gl.canvas.height,
    //       rx: this.gl.canvas.width / 2,
    //       ry: this.gl.canvas.height,
    //       angle: -Math.PI,
    //       vertices: 1000,
    //     }

    this.#initRadialLightData('circle', {
      x: this.gl.canvas.width / 2,
      y: this.gl.canvas.height / 2,
      r: this.gl.canvas.height / 2,
      angle: 2 * Math.PI,
      vertices: 1000,
    });

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
          const { triangles, mode, anim } = this.#triangular;

          trianglesLightness[triangle] = lightness;

          const fullTick =
            trianglesLightness.length === triangles &&
            trianglesLightness.every(lightness => lightness <= 0);

          if (fullTick) {
            if (
              (mode[1].side === 'both' && side === 'right') ||
              mode[1].side !== 'both'
            ) {
              mode[1].direction =
                mode[1].direction === 'forwards' ? 'backwards' : 'forwards';

              mode[1].triggerDimming = false;

              anim.deltaT = 0;
            }

            trianglesLightness = [];

            return true;
          }

          return false;
        };
      })(),
      pulsingLightness: (
        lightness,
        anim,
        lastShape,
        lightnessBorder,
        stepFurther,
        settings
      ) => {
        if (lastShape) anim.deltaT += this.animData.frameDeltaTime;

        const t = anim.deltaT * anim.speed;

        switch (anim.direction) {
          case 'inward':
            if (lightnessBorder === undefined) lightnessBorder = 0;

            if (!settings.subanim || settings.inverted) {
              lightness -= t;
            } else {
              lightness += anim.pastLightnessBorder - t;
            }

            if (lastShape && lightness <= lightnessBorder) {
              anim.direction = 'outward';
              anim.deltaT = 0;
              anim.pastLightnessBorder = t;
            }
            break;

          case 'outward':
            if (lightnessBorder === undefined) lightnessBorder = 1;

            if (!settings.subanim || settings.inverted) {
              lightness -= anim.pastLightnessBorder - t;
            } else {
              lightness += t;
            }

            if (lastShape && lightness >= lightnessBorder) {
              anim.direction = 'inward';
              anim.deltaT = 0;
              anim.pastLightnessBorder = t;
            }
            break;
        }

        if (anim.stepping.active && stepFurther !== undefined) {
          if (stepFurther) {
            const outlineShape = Object.prototype.hasOwnProperty.call(
              anim.stepping,
              'range'
            );

            if (outlineShape) {
              anim.stepping.nextShape +=
                anim.stepping.range - 1 + anim.stepping.step;
            } else {
              anim.stepping.nextShape += anim.stepping.step;
            }
          } else {
            anim.stepping.nextShape = 0;
          }
        }

        return lightness;
      },
      fluidLayers: (shapesCount, anim) => {
        const { op, firstShape, deltaT } = anim;

        anim.deltaT += this.animData.frameDeltaTime;

        const t = Math.round(deltaT * anim.speed);
        let newCount;

        switch (op) {
          case 'subtract':
            newCount = Math.max(firstShape, shapesCount - t);
            break;

          case 'add':
            newCount = Math.min(shapesCount, firstShape + t);
            break;
        }

        if (
          (anim.op === 'subtract' && newCount === firstShape) ||
          (anim.op === 'add' && newCount === shapesCount)
        ) {
          anim.deltaT = 0;
          anim.op = anim.op === 'subtract' ? 'add' : 'subtract';
        }

        return newCount;
      },
    };
  }

  #initRadialLightData(shapeType, conf) {
    const vao = this.gl.createVertexArray();

    let shape;

    switch (shapeType) {
      case 'circle':
        shape = new Circle(conf.x, conf.y, conf.r, conf.angle, conf.vertices);
        break;

      case 'ellipse':
        shape = new Ellipse(
          conf.x,
          conf.y,
          conf.rx,
          conf.ry,
          conf.angle,
          conf.vertices
        );
        break;
    }

    this.gl.bindVertexArray(vao);

    const circles = 1750;

    this.#radial = {
      vao,
      shape,
      count: circles,
      mat: ShaderUtils.mult2dMats(this.projectionMat, shape.mat),
      buffer: this.createAndBindVerticesBuffer(
        this.#locations.position,
        shape.coordinates,
        { size: 2 }
      ),
      inversedMode: { active: false },
      striped: {
        active: true,
        width: 20,
        spacing: 10,
        currentStripeStart: 0,
      },
      lStepMult: 1,
      anim: {
        pulsingLightness: {
          active: false,
          direction: 'outward',
          lOffset: 0,
          inwardBorderMult: 0,
          pastLightnessBorder: 0,
          deltaT: 0,
          speed: 10,
          stepping: {
            active: false,
            step: 7,
            range: 19,
          },
          cascade: {},
        },
        fluidLayers: {
          active: true,
          speed: 1024,
          firstShape: 500,
          op: 'subtract',
          deltaT: 0,
        },
      },
    };
  }

  #renderRadialLight() {
    this.gl.bindVertexArray(this.#radial.vao);

    const { inversedMode, anim, lStepMult, striped } = this.#radial;

    let count = this.#radial.count;

    if (this.#animate && anim.fluidLayers.active) {
      count = this.#effects.fluidLayers(count, anim.fluidLayers);
    }

    if (striped.active) {
      striped.currentStripeStart = 0
    }
    
    const rScaleStep = 1 / count;
    const lightnessStep = 1 / count;

    for (
      let shape = 0,
        rScale = 1,
        lightness = inversedMode.active || striped.active ? 1 : lightnessStep;
      shape < count;

    ) {
      const mat = ShaderUtils.mult2dMats(
        this.#radial.mat,
        ShaderUtils.init2dScaleMat(rScale, rScale)
      );

      let l = lightness;

      if (this.#animate) {
        const { pulsingLightness } = anim;

        if (pulsingLightness.active) {
          const { performPurePulsing, performStepPulsing } =
            PulsingUtils.getAnimsStates(anim.pulsingLightness, shape);

          if (performPurePulsing || performStepPulsing) {
            const isLastShape = PulsingUtils.lastShapeReached(
              anim.pulsingLightness,
              shape,
              count,
              { performStepPulsing }
            );

            const values = PulsingUtils.getAnimValues(
              anim.pulsingLightness,
              lightness,
              lightnessStep,
              isLastShape,
              isLastShape,
              inversedMode.active,
              { performStepPulsing },
              shape
            );

            l = this.#effects.pulsingLightness(
              l,
              pulsingLightness,
              isLastShape,
              values.lightnessBorder,
              values.stepFurther,
              {
                subanim: performStepPulsing,
                inverted: inversedMode.active,
              }
            );

            l -= anim.pulsingLightness.lOffset;
          }
        }
      }

      this.gl.uniformMatrix3fv(this.#locations.mat, false, mat);
      this.gl.uniform1f(this.#locations.lightness, l);
      this.gl.drawArrays(
        this.gl.LINE_STRIP,
        0,
        this.#radial.shape.verticesCount + 1
      );

      if (
        striped.active &&
        shape === striped.currentStripeStart + striped.width - 1
      ) {
        striped.currentStripeStart += striped.width + striped.spacing;
        shape = striped.currentStripeStart;
        rScale = 1 - striped.currentStripeStart * rScaleStep;
      } else {
        if (!striped.active) {
          lightness = inversedMode.active
            ? lightness - lightnessStep * lStepMult
            : lightness + lightnessStep * lStepMult;
        }

        rScale -= rScaleStep;
        shape++;
      }
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
      inversedMode: { active: false },
      lStepMult: 1,
      anim: {
        pulsingLightness: {
          active: true,
          direction: 'outward',
          lOffset: 0.05,
          inwardBorderMult: 2,
          pastLightnessBorder: 0,
          deltaT: 0,
          speed: 0.1,
          stepping: {
            active: false,
            step: 2,
            nextShape: 0,
          },
          cascade: {
            active: true,
            controlShape: 0,
          },
        },
        fluidLayers: {
          active: false,
          speed: 36,
          firstShape: 9,
          op: 'subtract',
          deltaT: 0,
        },
      },
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
          const { pulsingLightness } = anim;

          if (pulsingLightness.active) {
            const {
              performPurePulsing,
              performStepPulsing,
              performCascadePulsing,
            } = PulsingUtils.getAnimsStates(anim.pulsingLightness, circle);

            if (
              performPurePulsing ||
              performStepPulsing ||
              performCascadePulsing
            ) {
              const lastCircleInDirection = PulsingUtils.lastShapeReached(
                anim.pulsingLightness,
                circle,
                count,
                { performStepPulsing, performCascadePulsing }
              );

              const values = PulsingUtils.getAnimValues(
                anim.pulsingLightness,
                l,
                lightnessStep,
                lastCircleInDirection && direction === directions - 1,
                lastCircleInDirection,
                inversedMode.active,
                { performStepPulsing, performCascadePulsing }
              );

              l = this.#effects.pulsingLightness(
                l,
                pulsingLightness,
                lastCircleInDirection,
                values.lightnessBorder,
                values.stepFurther,
                {
                  subanim: performStepPulsing || performCascadePulsing,
                  inverted: inversedMode.active,
                }
              );

              // l -= anim.pulsingLightness.lOffset;
            }
          }
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
    const squares = 1;
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
      trianglesCount: 10,
      buffers: {
        vertex: this.createAndBindVerticesBuffer(
          this.#locations.position,
          coords,
          { size: 2 }
        ),
        index: this.createAndBindElementsBuffer(indices, this.gl.STATIC_READ),
      },
      inversedMode: { active: true },
      lStepMult: 1,
      anim: {
        pulsingLightness: {
          active: true,
          direction: 'inward',
          lOffset: 0.05,
          inwardBorderMult: 1,
          pastLightnessBorder: 0,
          deltaT: 0,
          speed: 0.2,
          stepping: {
            active: false,
            step: 4,
            nextShape: 0,
          },
          cascade: {
            active: false,
            controlShape: 0,
          },
        },
        fluidLayers: {
          active: false,
          speed: 36,
          firstShape: 9,
          op: 'subtract',
          deltaT: 0,
        },
        rotation: { active: false, speed: 0.1, angle: 0 },
      },
    };
  }

  #renderTriangularStar() {
    const { anim, vao, mats, squares, buffers, inversedMode, lStepMult } =
      this.#triangularStar;

    let { trianglesCount } = this.#triangularStar;

    if (this.#animate && anim.fluidLayers.active) {
      trianglesCount = this.#effects.fluidLayers(
        trianglesCount,
        anim.fluidLayers
      );
    }

    const scaleStep = 1 / trianglesCount;
    const lightnessStep = 1 / trianglesCount;

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(inversedMode.active ? this.gl.LESS : this.gl.GREATER);
    this.gl.clearDepth(inversedMode.active ? 1 : 0);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

    this.gl.bindVertexArray(vao);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    for (let square = 0; square < squares; square++) {
      let squareMat = mats.squares[square];

      if (this.#animate && anim.rotation.active) {
        anim.rotation.angle -=
          this.animData.frameDeltaTime * anim.rotation.speed;

        squareMat = ShaderUtils.mult2dMats(
          squareMat,
          ShaderUtils.init2dRotationMat(anim.rotation.angle)
        );
      }

      for (let side = 0; side < 4; side++) {
        for (
          let triangle = 0,
            scale = 1,
            lightness = inversedMode.active ? 1 : lightnessStep;
          triangle < trianglesCount;
          scale -= scaleStep,
            lightness = inversedMode.active
              ? lightness - lightnessStep * lStepMult
              : lightness + lightnessStep * lStepMult,
            triangle++
        ) {
          const triangleMat = ShaderUtils.mult2dMats(
            squareMat,
            ShaderUtils.init2dScaleMat(scale, scale)
          );

          let l = lightness;

          if (this.#animate && anim.pulsingLightness.active) {
            const {
              performPurePulsing,
              performStepPulsing,
              performCascadePulsing,
            } = PulsingUtils.getAnimsStates(anim.pulsingLightness, triangle);

            if (
              performPurePulsing ||
              performStepPulsing ||
              performCascadePulsing
            ) {
              const lastSideReached = square === squares - 1 && side === 3;
              const lastTriangleInSideReached = PulsingUtils.lastShapeReached(
                anim.pulsingLightness,
                triangle,
                trianglesCount,
                { performStepPulsing, performCascadePulsing }
              );

              const lastTriangle = lastSideReached && lastTriangleInSideReached;

              const values = PulsingUtils.getAnimValues(
                anim.pulsingLightness,
                l,
                lightnessStep,
                lastTriangle,
                lastTriangleInSideReached,
                inversedMode.active,
                { performStepPulsing, performCascadePulsing }
              );

              l = this.#effects.pulsingLightness(
                l,
                anim.pulsingLightness,
                lastTriangle,
                values.lightnessBorder,
                values.stepFurther,
                {
                  subanim: performStepPulsing || performCascadePulsing,
                  inverted: inversedMode.active,
                }
              );

              // l -= anim.pulsingLightness.lOffset;
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
      inversedMode: { active: false },
      lStepMult: 1,
      anim: {
        pulsingLightness: {
          active: true,
          direction: 'outward',
          lOffset: 0.05,
          inwardBorderMult: 2,
          pastLightnessBorder: 0,
          deltaT: 0,
          speed: 0.1,
          stepping: {
            active: false,
            step: 2,
            nextShape: 0,
          },
          cascade: {
            active: true,
            controlShape: 0,
          },
        },
        fluidLayers: {
          active: false,
          speed: 36,
          firstShape: 9,
          op: 'subtract',
          deltaT: 0,
        },
      },
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
          const { pulsingLightness } = anim;

          if (pulsingLightness.active) {
            const {
              performPurePulsing,
              performStepPulsing,
              performCascadePulsing,
            } = PulsingUtils.getAnimsStates(anim.pulsingLightness, ellipse);

            if (
              performPurePulsing ||
              performStepPulsing ||
              performCascadePulsing
            ) {
              const lastEllipseInDirection = PulsingUtils.lastShapeReached(
                anim.pulsingLightness,
                ellipse,
                countPerEllipse,
                { performStepPulsing, performCascadePulsing }
              );

              const values = PulsingUtils.getAnimValues(
                anim.pulsingLightness,
                l,
                lightnessStep,
                lastEllipseInDirection && direction === directions - 1,
                lastEllipseInDirection,
                inversedMode.active,
                { performStepPulsing, performCascadePulsing }
              );

              l = this.#effects.pulsingLightness(
                l,
                pulsingLightness,
                lastEllipseInDirection,
                values.lightnessBorder,
                values.stepFurther,
                {
                  subanim: performStepPulsing || performCascadePulsing,
                  inverted: inversedMode.active,
                }
              );

              // l -= anim.pulsingLightness.lOffset;
            }
          }
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

    const tPercMult = 80;

    this.#triangular = {
      vaos: { left: leftSideVao, right: rightSideVao },
      lines: vertices,
      coordinates: leftSideCoordinates,
      indices: leftIndices,
      triangles,
      // lightnessStep: 0.5 / (triangles - 1),
      lightnessStep: 1 / (triangles - 1),
      mat: this.projectionMat,
      mode: [
        'pendulum', // forwards, backwards, pendulum
        {
          direction: 'backwards',
          frontTriangle: undefined,
          triggerDimming: false,
          // lightnessMult: (0.5 / 100) * tPercMult,
          lightnessMult: (1 / 100) * tPercMult,
          triangleMult: (triangles / 100) * tPercMult,
          side: 'left',
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
      anim: { deltaT: 0 },
    };
  }

  #renderTriangles() {
    const { mode } = this.#triangular;

    this.gl.uniformMatrix3fv(this.#locations.mat, false, this.#triangular.mat);

    switch (mode[0]) {
      case 'forwards':
        this.#renderTrianglesForwards(mode[1].side);
        break;

      case 'backwards':
        this.#renderTrianglesBackwards(mode[1].side);
        break;

      case 'pendulum':
        switch (mode[1].side) {
          case 'both':
            this.#renderTrianglesPendulum('left');
            this.#renderTrianglesPendulum('right');
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

  // #renderTrianglesPendulum(side) {
  //   this.gl.enable(this.gl.BLEND);
  //   this.gl.blendEquation(this.gl.FUNC_ADD);
  //   this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.DST_COLOR);
  //   this.gl.disable(this.gl.DEPTH_TEST);

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
  //       lightness = 0.5;
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

  //       lightness = 0.5 - triangleStepsFromFront * lightnessStep;
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

  //     if (
  //       triggerDimming &&
  //       this.#effects.pendulumTick(triangle, lightness, side)
  //     )
  //       return;
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

  #renderTrianglesPendulum(side) {
    const { triangles, mode, lightnessStep, anim } = this.#triangular;
    const {
      direction,
      triggerDimming,
      triangleMult,
      lightnessMult,
      side: confSide,
    } = mode[1];

    if (!triggerDimming) {
      const roundedT = Math.round(anim.deltaT * triangleMult);

      let frontTriangle =
        direction === 'forwards' ? 0 + roundedT : triangles - 1 - roundedT;

      switch (direction) {
        case 'forwards': {
          const remainingTriangles = triangles - 1 - frontTriangle;

          if (remainingTriangles < 0) {
            frontTriangle = triangles - 1;
          }
          break;
        }

        case 'backwards': {
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
        lightness = 1;
      } else if (
        (direction === 'forwards' && triangle > frontTriangle) ||
        (direction === 'backwards' && triangle < frontTriangle)
      ) {
        lightness = 0;
      } else if (
        (direction === 'forwards' && triangle < frontTriangle) ||
        (direction === 'backwards' && triangle > frontTriangle)
      ) {
        const triangleStepsFromFront =
          direction === 'backwards'
            ? triangle - frontTriangle
            : frontTriangle - triangle;

        lightness = 1 - triangleStepsFromFront * lightnessStep;
      }

      if (triggerDimming) {
        lightness -= anim.deltaT * lightnessMult;
      }

      this.gl.uniform1f(this.#locations.lightness, lightness);

      this.gl.drawElements(
        this.gl.TRIANGLES,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );

      if (triggerDimming && this.#effects.pendulumTick(triangle, lightness))
        return;
    }

    if (!triggerDimming) {
      switch (direction) {
        case 'forwards':
          if (
            frontTriangle === triangles - 1 &&
            ((confSide === 'both' && side === 'right') || confSide !== 'both')
          ) {
            anim.deltaT = 0;

            mode[1].triggerDimming = true;
          }
          break;

        case 'backwards':
          if (
            frontTriangle === 0 &&
            ((confSide === 'both' && side === 'right') || confSide !== 'both')
          ) {
            anim.deltaT = 0;

            mode[1].triggerDimming = true;
          }
          break;
      }
    }

    anim.deltaT += this.animData.frameDeltaTime;
  }

  renderScene(timeNow) {
    super.renderScene(timeNow);

    this.gl.useProgram(this.#program);

    this.#renderRadialLight();
    // this.#renderRadialQuad();
    // this.#renderEllipticQuad();
    // this.#renderTriangularStar();
    // this.#renderTriangles();

    if (this.#animate) this.requestAnimationFrame();
  }
}
