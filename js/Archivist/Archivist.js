import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import ArchivistUtils from "./ArchivistUtils.js";

class Archivist extends Shader {
  constructor(shaders) {
    super("3d", { fov: Math.PI / 2.5, near: 0, far: 2000 });

    this.initShaders(shaders).then((programs) => {
      const [archivist] = programs;

      this.#archivist = {
        program: archivist,
        mat: ShaderUtils.mult3dMats(this.projectionMat, [
          ShaderUtils.lookAtMat([0, 0, -1.45]),
          ShaderUtils.init3dTranslationMat(1.1, 0, 0),
          ShaderUtils.init3dRotationMat("y", -Math.PI / 6.5),
        ]),
      };

      this.#initLocations(programs);
      this.#initObjectsData();

      // this.animate = true;

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
    this.#initHead();
    this.#initTentacles();
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
    let { mat } = this.#archivist;

    const tentacles = ArchivistUtils.getTentaclesData();
    const coordinates = new Float32Array(
      tentacles.flatMap((tentacle) => tentacle.coordinates)
    );

    mat = ShaderUtils.mult3dMats(
      mat,
      ShaderUtils.init3dTranslationMat(0, -0.8, 0)
    );

    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.#tentacles = {
      vao,
      tentacles,
      mat,
      buffers: {
        vertices: this.createAndBindVerticesBuffer(
          locations.position,
          coordinates,
          { size: 3 }
        ),
      },
    };
  }

  #renderTentacles() {
    const { locations } = this.#archivist;
    const { tentacles, vao, mat } = this.#tentacles;

    this.gl.bindVertexArray(vao);
    this.gl.uniformMatrix4fv(locations.mat, false, mat);
    this.gl.uniform3f(locations.color, 0.5, 0.5, 0.5);

    for (
      let tentacle = 0, verticesOffset = 0;
      tentacle < tentacles.length;
      verticesOffset += tentacles[tentacle].vertices, tentacle++
    ) {
      const { vertices } = tentacles[tentacle];

      this.gl.drawArrays(this.gl.LINE_STRIP, verticesOffset, vertices);
    }
  }

  computeScene() {
    this.gl.useProgram(this.#archivist.program);

    this.#renderHead();
    this.#renderTentacles();
  }
}

export default Archivist;