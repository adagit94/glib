import Shader from "./Shader.js";
import ShaderUtils from "./ShaderUtils.js";

export default class CuShader extends Shader {
  static #cubeCorners = ["bottomLeft", "topRight"]; // , , "bottomRight", "topLeft"
  static #curvesPerCorner = 5; // , "topRight", "bottomRight", "topLeft"

  static #getCubeData = () => {
    const vertices = new Float32Array([
      // FRONT
      0.75, 0.75, 0.75, 0.75, -0.75, 0.75, -0.75, -0.75, 0.75, -0.75, 0.75,
      0.75,

      // BACK
      0.75, 0.75, -0.75, 0.75, -0.75, -0.75, -0.75, -0.75, -0.75, -0.75, 0.75,
      -0.75,
    ]);

    const indices = new Uint16Array([
      // FRONT
      0, 1, 1, 2, 2, 3, 3, 0,

      // BACK
      4, 5, 5, 6, 6, 7, 7, 4,

      // TOP
      0, 4, 3, 7,

      // BOTTOM
      2, 6, 1, 5,
    ]);

    return [vertices, indices];
  };

  static #getCrossChannelData = () => {
    const verticesArcCount = 100;
    const arcRad = Math.PI;
    const radStep = arcRad / verticesArcCount;
    const origin = 0.5;
    const baseRadius = 0.15;

    let coordinates = [];

    for (let cornerI = 0; cornerI < CuShader.#cubeCorners.length; cornerI++) {
      const corner = CuShader.#cubeCorners[cornerI];

      for (
        let curve = 0, r = baseRadius;
        curve < CuShader.#curvesPerCorner;
        r /= 2, curve++
      ) {
        const o = curve === 0 ? origin : origin - curve / 100;

        for (
          let i = 0, rad = 0, secondHalfMult = 1;
          i < verticesArcCount;
          rad += radStep, i++
        ) {
          let x;
          let y;
          let z;

          switch (corner) {
            case "bottomLeft":
              x = o + Math.cos(rad) * r;
              y = x * -1;
              z = o * -1 - Math.sin(rad) * r;
              break;

            case "topRight":
              x = -o - Math.cos(rad) * r;
              y = x * -1;
              z = o + Math.sin(rad) * r;
              break;
          }

          if (rad > Math.PI / 2) {
            const mult = 1 - secondHalfMult / 1000;

            if (curve === 0) {
              z *= mult;

              secondHalfMult *= 1.1632;
            } else {
              z *= mult;
              x *= mult;

              switch (curve) {
                case 1:
                  secondHalfMult *= 1.11;
                  break;

                case 2:
                  secondHalfMult *= 1.12;
                  break;

                default:
                  secondHalfMult *= 1.122;
              }
            }
          }

          coordinates.push(x, y, z);
        }
      }
    }

    return new Float32Array(coordinates);
  };

  constructor(shaders) {
    super();

    this.initShaders(shaders).then(([cube, crossChannel]) => {
      this.#cube = {
        program: cube,
      };

      this.#crossChannel = {
        program: crossChannel,
      };

      this.#initAttribLocations();
      this.#initObjectsData();

      this.gl.canvas.dispatchEvent(new CustomEvent("cuInitCompleted"));
    });
  }

  #cube;
  #crossChannel;
  #animData = {
    sceneYRotation: 0,
  };

  #initAttribLocations = () => {
    this.#cube.attribLocations = {
      position: this.gl.getAttribLocation(this.#cube.program, "a_position"),
      projection: this.gl.getUniformLocation(
        this.#cube.program,
        "u_projectionMat"
      ),
    };

    this.#crossChannel.attribLocations = {
      position: this.gl.getAttribLocation(
        this.#crossChannel.program,
        "a_position"
      ),
      projection: this.gl.getUniformLocation(
        this.#crossChannel.program,
        "u_projectionMat"
      ),
    };
  };

  #initObjectsData = () => {
    const [cubeVertices, cubeIndices] = CuShader.#getCubeData();

    this.#cube.vao = this.gl.createVertexArray();
    this.#crossChannel.vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(this.#cube.vao);

    this.#cube.vertices = cubeVertices;
    this.#cube.indices = cubeIndices;
    this.#cube.buffers = {
      vertices: this.createAndBindVerticesBuffer(
        this.#cube.attribLocations.position,
        cubeVertices,
        { size: 3 }
      ),
      elements: this.createAndBindElementsBuffer(cubeIndices),
    };
    this.#cube.mat = ShaderUtils.init3dPureMat();

    const crossChannelVertices = CuShader.#getCrossChannelData();

    this.gl.bindVertexArray(this.#crossChannel.vao);

    this.#crossChannel.vertices = crossChannelVertices;
    this.#crossChannel.buffers = {
      vertices: this.createAndBindVerticesBuffer(
        this.#crossChannel.attribLocations.position,
        crossChannelVertices,
        { size: 3 }
      ),
    };
    this.#crossChannel.mats = [
      ShaderUtils.init3dTranslationMat(-0.2, 0, -0.5),
      ShaderUtils.init3dTranslationMat(0.2, 0, 0.5),
    ];

    ShaderUtils.rotate3d(this.#crossChannel.mats[0], "y", -Math.PI / 6.4);
    ShaderUtils.rotate3d(this.#crossChannel.mats[0], "x", -Math.PI / 3.42);
    ShaderUtils.rotate3d(this.#crossChannel.mats[0], "z", Math.PI / 16);
    ShaderUtils.rotate3d(this.#crossChannel.mats[1], "y", -Math.PI / 6.4);
    ShaderUtils.rotate3d(this.#crossChannel.mats[1], "x", -Math.PI / 3.42);
    ShaderUtils.rotate3d(this.#crossChannel.mats[1], "z", Math.PI / 16);

    // ShaderUtils.scale(this.#crossChannel.bottomLeftMat, { d: 1.5, });
    // ShaderUtils.scale(this.#crossChannel.topRightMat, { d: 1.5, });
  };

  #renderCrossChannel = cubeMat => {
    const singleCrossChannelCurveVerticesCount =
      this.#crossChannel.vertices.length /
      CuShader.#cubeCorners.length /
      CuShader.#curvesPerCorner /
      3;

    const cornerMats = [
      ShaderUtils.mult3dMats(cubeMat, this.#crossChannel.mats[0]),
      ShaderUtils.mult3dMats(cubeMat, this.#crossChannel.mats[1]),
    ];

    for (let corner = 0; corner < CuShader.#cubeCorners.length; corner++) {
      for (let curve = 0; curve < CuShader.#curvesPerCorner; curve++) {
        this.gl.uniformMatrix4fv(
          this.#crossChannel.attribLocations.projection,
          false,
          cornerMats[corner]
        );

        this.gl.drawArrays(
          this.gl.LINE_STRIP,
          (corner * CuShader.#curvesPerCorner + curve) *
            singleCrossChannelCurveVerticesCount,
          singleCrossChannelCurveVerticesCount - 1
        );
      }
    }
  };

  renderScene = timeNow => {
    const timeInSecs = timeNow / 1000;
    const deltaTime = timeInSecs - this.#animData.prevAnimTime;

    this.#animData.prevAnimTime = timeInSecs;

    if (!Number.isNaN(deltaTime)) {
      this.#animData.sceneYRotation += deltaTime / 10;
    }

    const projectionMat = ShaderUtils.initPerspectiveMat(
      Math.PI / 2,
      this.gl.canvas.clientWidth / this.gl.canvas.clientHeight,
      0.1,
      2000
    );

    let lookAtMat = ShaderUtils.lookAtMat([0, 0, -1.75]);

    ShaderUtils.translate3d(lookAtMat, { y: 0 });
    ShaderUtils.rotate3d(lookAtMat, "y", Math.PI / 6); // this.#animData.sceneYRotation

    const cubeMat = ShaderUtils.mult3dMats(
      ShaderUtils.mult3dMats(projectionMat, lookAtMat),
      this.#cube.mat
    );

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.#cube.program);
    this.gl.bindVertexArray(this.#cube.vao);
    this.gl.uniformMatrix4fv(
      this.#cube.attribLocations.projection,
      false,
      cubeMat
    );

    this.gl.drawElements(
      this.gl.LINES,
      this.#cube.indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );

    this.gl.useProgram(this.#crossChannel.program);
    this.gl.bindVertexArray(this.#crossChannel.vao);
    this.#renderCrossChannel(cubeMat);

    // window.requestAnimationFrame(this.renderScene);
  };
}

// const cuShader = new CuShader({
//   cube: {
//     vShader: "shaders/cu/cube/cube.vert",
//     fShader: "shaders/cu/cube/cube.frag",
//   },
//   crossChannel: {
//     vShader: "shaders/cu/cross-channel/cross-channel.vert",
//     fShader: "shaders/cu/cross-channel/cross-channel.frag",
//   },
// });

// cuShader.gl.canvas.addEventListener("cuInitCompleted", () => {
//   window.requestAnimationFrame(cuShader.renderScene);
// });
