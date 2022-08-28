import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import HexagonalSphere from "../Shapes/3d/HexagonalSphere/HexagonalSphere.js";

class Playground extends Shader {
    constructor() {
        super("3d", { fov: Math.PI / 4, near: 0, far: 2000 });

        this.animate = false;

        this.#init();
    }

    #program;
    #mats;
    #locations;
    #data;

    #init = async () => {
        this.#program = await ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Playground/playground.vert",
            fShader: "js/Playground/playground.frag",
        });

        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2]));

        this.#mats = {
            scene: ShaderUtils.mult3dMats(this.projectionMat, viewMat),
        };

        this.#locations = this.initCommonLocations([this.#program])[0];

        this.#initData();

        this.requestAnimationFrame();
    };

    #initData() {}

    #render() {}

    computeScene() {
        this.gl.useProgram(this.#program);
        this.#render();
    }
}

export default Playground;
