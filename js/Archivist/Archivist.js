import Shader from "../Shader/Shader";

class Archivist extends Shader {
  constructor(shaders) {
    super();

    this.initShaders(shaders).then((programs) => {
      const [archivist] = programs;

      this.#archivist = { program: archivist };

      this.#initLocations(programs);
      this.#initObjectsData();

      // this.animate = true;

      this.requestAnimationFrame();
    });
  }

  #archivist;

  #initLocations(programs) {
    const locations = this.initCommonLocations(programs);

    this.#archivist.locations = {
      ...locations[0],
      color: this.gl.getUniformLocation(this.#archivist.program, "u_color"),
    };
  }

  #initObjectsData() {
    this.#initHead();
    this.#initTentacles();
  }

  computeScene() {}
}

export default Archivist;
