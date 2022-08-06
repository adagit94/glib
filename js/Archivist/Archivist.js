import Shader from '../Shader/Shader.js';
import ShaderUtils from '../Shader/ShaderUtils.js';
import ArchivistUtils from './ArchivistUtils.js';

class Archivist extends Shader {
  constructor(shaders) {
    super('3d', { fov: Math.PI / 2.5, near: 0, far: 2000 });

    this.initShaders(shaders).then(programs => {
      const [archivist] = programs;

      this.#archivist = {
        program: archivist,
        mat: ShaderUtils.mult3dMats(this.projectionMat, [
          ShaderUtils.lookAtMat([0, 0, -1.45], [-0.6, 0, 0]),
          ShaderUtils.init3dTranslationMat(1.1, 0, 0),
        ]),
      };

      this.#initLocations(programs);
      this.#initObjectsData();

      this.animate = true;

      this.gl.enable(this.gl.DEPTH_TEST);

      this.requestAnimationFrame();
    });
  }

  #archivist;
  #head;
  #tentacles;

  #initLocations(programs) {
    const [archivistLocs] = this.initCommonLocations(programs);

    this.#archivist.locations = archivistLocs;
  }

  #initObjectsData() {
    const tentaclesMat = ShaderUtils.mult3dMats(
      this.#archivist.mat,
      ShaderUtils.init3dTranslationMat(0, -0.8, 0)
    );

    this.#initHead();

    ArchivistUtils.initPressureCirclesCommonData(
      this,
      tentaclesMat,
      this.#archivist.locations
    );

    this.#tentacles = ArchivistUtils.initTentaclesData();
    this.#tentacles.mat = tentaclesMat;
  }

  #initHead() {
    const { locations, mat } = this.#archivist;
    const { coordinates, indices } = ArchivistUtils.getHeadData();
    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.#head = {
      vao,
      mat,
      buffers: {
        vertices: this.createAndBindVerticesBuffer(
          locations.position,
          coordinates,
          { size: 3 }
        ),
        indices: this.createAndBindIndicesBuffer(indices),
      },
    };
  }

  #renderHead() {
    const { locations } = this.#archivist;
    const { buffers, mat, vao } = this.#head;

    this.gl.bindVertexArray(vao);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.uniformMatrix4fv(locations.mat, false, mat);

    for (let triangle = 0; triangle < 8; triangle++) {
      this.gl.uniform3f(locations.color, 0.05, 0.05, 0.05);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );

      this.gl.uniform3f(locations.color, 0.5, 0.5, 0.5);
      this.gl.drawElements(
        this.gl.LINE_LOOP,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );
    }
  }

  #initTentacles() {
    const { locations } = this.#archivist;

    const tentacles = ArchivistUtils.computeTentaclesData(
      this.#tentacles,
      this.animate,
      this.animData
    );
    const coordinates = new Float32Array(
      tentacles.flatMap(tentacle => tentacle.coordinates)
    );

    if (this.gl.isVertexArray(this.#tentacles.vao)) {
      this.gl.deleteVertexArray(this.#tentacles.vao);
    }

    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.#tentacles.tentacles = tentacles;
    this.#tentacles.vao = vao;
    this.#tentacles.buffers = {
      vertices: this.createAndBindVerticesBuffer(
        locations.position,
        coordinates,
        { size: 3 },
        this.gl.STREAM_DRAW
      ),
    };
  }

  #renderTentacles() {
    const { locations } = this.#archivist;
    const { tentacles, vao, mat } = this.#tentacles;

    for (
      let tentacle = 0, verticesOffset = 0;
      tentacle < tentacles.length;
      verticesOffset += tentacles[tentacle].vertices, tentacle++
    ) {
      const {
        vertices,
        coordinates,
        moves,
        currentMove,
        pressureCircles,
        triggerPressureOnMoves,
        pressurePerformedOnMoves,
      } = tentacles[tentacle];

      this.gl.bindVertexArray(vao);
      this.gl.depthFunc(this.gl.ALWAYS);
      this.gl.uniform3f(locations.color, 0.5, 0.5, 0.5);
      this.gl.uniformMatrix4fv(locations.mat, false, mat);

      this.gl.drawArrays(this.gl.LINE_STRIP, verticesOffset, vertices);

      const triggerPressure =
        triggerPressureOnMoves.includes(currentMove) &&
        !pressurePerformedOnMoves.includes(currentMove);

      if (triggerPressure || pressureCircles.lightnessHandlerActive) {
        if (triggerPressure) {
          pressurePerformedOnMoves.push(currentMove);
        }

        this.gl.depthFunc(this.gl.GREATER);
        this.gl.clearDepth(0);

        this.#renderPressureCircles(
          triggerPressure,
          pressureCircles,
          moves[currentMove],
          [
            coordinates[coordinates.length - 3],
            coordinates[coordinates.length - 2],
            coordinates[coordinates.length - 1],
          ]
        );
      }
    }
  }

  #renderPressureCircles(triggerPressure, pressureCircles, move, coordinates) {
    const { locations } = this.#archivist;
    const { vao, circles, colors, lightnessHandler, circle } = pressureCircles;

    const vertices = circle.verticesCount + 1;

    if (triggerPressure) {
      let { mat } = pressureCircles;

      pressureCircles.lightnessHandlerActive = true;
      pressureCircles.positionedMats = [];
      mat = ShaderUtils.mult3dMats(
        mat,
        ShaderUtils.init3dTranslationMat(...coordinates)
      );

      if (move?.mat) {
        mat = ShaderUtils.mult3dMats(mat, move.mat);
      }

      const scaleStep = 1 / circles;

      for (let c = 0, scale = scaleStep; c < circles; scale += scaleStep, c++) {
        const scaledMat = ShaderUtils.mult3dMats(
          mat,
          ShaderUtils.init3dScaleMat(scale, scale, 1)
        );

        pressureCircles.positionedMats.push(scaledMat);
      }
    }

    this.gl.bindVertexArray(vao);

    for (let circle = 0; circle < circles; circle++) {
      const color = colors[circle];
      const mat = pressureCircles.positionedMats[circle];

      this.gl.uniform3f(locations.color, ...color.val);
      this.gl.uniformMatrix4fv(locations.mat, false, mat);

      this.gl.drawArrays(this.gl.LINE_STRIP, 0, vertices);
    }

    lightnessHandler(this.animData.frameDeltaTime, pressureCircles);
  }

  #computeTentacles() {
    this.#initTentacles();
    this.#renderTentacles();
  }

  computeScene() {
    this.gl.useProgram(this.#archivist.program);

    this.#computeTentacles();
    this.#renderHead();
  }
}

export default Archivist;
