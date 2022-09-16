import SpotLight from "../Lights/SpotLight/SpotLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";
import Hexagon from "../Shapes/3d/Hexagon/Hexagon.js";
import Plane from "../Shapes/3d/Plane.js";

class Playground extends Shader {
    constructor() {
        super("3d", { fov: Math.PI / 4, near: 0, far: 20 });

        this.animate = true;

        this.#init();
    }

    #program;
    #mats;
    #locations;
    #data;
    #light;

    #init = async () => {
        this.#program = await ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Playground/playground.vert",
            fShader: "js/Playground/playground.frag",
        });

        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2]));

        this.mats.scene = ShaderUtils.mult3dMats(this.projectionMat, viewMat);

        this.#locations = this.initCommonLocations([this.#program])[0];

        this.#initData();
    };

    #initData() {
        const wireframe = false;
        let plane = new Plane(0.1, 4, 4, wireframe);

        this.initBuffers([
            {
                plane: {
                    vertices: plane.vertices,
                    indices: !wireframe && plane.indices,
                    normals: plane.normals,
                },
            },
        ]);
    }

    computeScene = () => {};
}

export default Playground;
