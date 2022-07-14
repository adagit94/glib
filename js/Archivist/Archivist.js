import Shader from "../Shader/Shader";
import ArchivistUtils from "./ArchivistUtils";

class Archivist extends Shader {
  constructor(shaders) {
    super("3d", { fov: Math.PI, near: 0, far: 1000 });

    this.initShaders(shaders).then((programs) => {
      const [archivist] = programs;

      this.#archivist = { program: archivist, mat: this.projectionMat };

      this.#initLocations(programs);
      this.#initObjectsData();

      // this.animate = true;

      this.requestAnimationFrame();
    });
  }

  #archivist;
  #head;

  #initLocations(programs) {
    const [archivistLocs] = this.initCommonLocations(programs);

    this.#archivist.locations = archivistLocs;
  }

  #initObjectsData() {
    this.#initHead();
    this.#initTentacles();
  }

  #initHead() {
    const { locations } = this.#archivist;
    const { coordinates, indices } = ArchivistUtils.getHeadData();
    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.#head = {
      vao,
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

    for (let triangle = 0; triangle < 8; triangle++) {
      this.gl.uniformMatrix4fv(locations.mat, false, mat);
      this.gl.uniform3f(locations.color, 0, 0, 0.75);

      this.gl.drawElements(
        this.gl.LINE_LOOP,
        3,
        this.gl.UNSIGNED_SHORT,
        triangle * 3 * 2
      );
    }
  }

  computeScene() {
    this.gl.useProgram(this.#archivist.program);

    this.#renderHead();
  }
}

export default Archivist;
