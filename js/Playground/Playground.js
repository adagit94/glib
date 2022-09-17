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

        this.#initData();
    }

    #light;
    #storage;

    async #initData() {
        const wireframe = false;
        const plane = new Plane(0.1, 4, 4, wireframe);

        this.#storage = { plane };

        const light = (this.#light = new SphericLight(this.gl, {
            color: [1, 1, 1],
            lightPosition: [0.5, 0, 0.5],
            lightColor: [1, 1, 1],
        }));

        await light.init();
        await this.init([
            {
                name: "playground",
                paths: { vShader: "js/Playground/playground.vert", fShader: "js/Playground/playground.frag" },
                buffersData: {
                    plane: {
                        vertices: [light.getPositionLocation(), plane.vertices],
                        indices: !wireframe && plane.indices,
                        normals: [light.getNormalLocation(), plane.normals],
                    },
                },
            },
        ]);

        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2]));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projectionMat, viewMat);

        this.requestAnimationFrame()
    }

    computeScene = () => {
        const planeMat = this.#storage.plane.mat
        
        ShaderUtils.rotate3d(planeMat, "y" -Math.PI / 4) // this.animData.frameDeltaTime / 2
        
        this.#light.uniformsSources.finalMat = ShaderUtils.mult3dMats(this.mats.scene, planeMat);
        this.#light.uniformsSources.objectToLightMat = planeMat;

        this.#light.setLight();

         // render logic
    };
}

export default Playground;
