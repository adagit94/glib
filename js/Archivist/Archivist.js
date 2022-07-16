import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import ArchivistUtils from "./ArchivistUtils.js";

class Archivist extends Shader {
  constructor(shaders) {
    super("3d", { fov: Math.PI / 2.5, near: 0, far: 2000 });

    this.initShaders(shaders).then((programs) => {
      const [archivist] = programs;

      let mat = ShaderUtils.mult3dMats(this.projectionMat, [
        ShaderUtils.lookAtMat([0, 0, -1.3], [0, 0, 0]),
        ShaderUtils.init3dTranslationMat(0.8, 0, 0),
        ShaderUtils.init3dRotationMat("y", Math.PI / 40),
      ]);

      //   ShaderUtils.translate3d(mat, { x: 0.25, y: 0 });

      this.#archivist = {
        program: archivist,
        mat,
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
    this.gl.uniform3f(locations.color, 0, 0, 0.75);

    for (let triangle = 0; triangle < 8; triangle++) {
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
    const { coordinates } = ArchivistUtils.getTentaclesData();
    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.#tentacles = {
      vao,
      buffers: {
        vertices: this.createAndBindVerticesBuffer(
          locations.position,
          coordinates,
          { size: 3 }
        ),
      },
    };
  }

  computeScene() {
    this.gl.useProgram(this.#archivist.program);

    this.#renderHead();
  }
}

export default Archivist;
