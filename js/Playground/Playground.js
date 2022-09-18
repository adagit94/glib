import DiffuseLight from "../Lights/DiffuseLight/DiffuseLight.js";
import SpecularLight from "../Lights/Phong/SpecularLight.js.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Plane from "../Shapes/3d/Plane.js";

class Playground extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 0, far: 20 });

        this.#initData();
    }

    #light;
    #plane;

    async #initData() {
        const wireframe = false;
        const plane = new Plane(0.1, 4, 4, wireframe);

        this.#plane = plane;

        const cameraPosition = [0, 0, 1];
        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat);

        const light = (this.#light = new SpecularLight(this.gl, {
            color: [0, 0, 1],
            lightPosition: [0, 0, -0.1],
            lightColor: [1, 1, 1],
            cameraPosition,
            shininess: 200,
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

        this.animate = false;

        this.requestAnimationFrame();
    }

    computeScene = () => {
        const planeMat = ShaderUtils.mult3dMats(this.#plane.mat, [
            // ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 10),
            ShaderUtils.init3dRotationMat("x", -Math.PI / 2),
        ]);

        console.log("planeMat", planeMat);

        this.#light.uniformsSources.finalMat = ShaderUtils.mult3dMats(this.mats.scene, planeMat);
        this.#light.uniformsSources.modelMat = planeMat;
        this.#light.uniformsSources.normalMat = ShaderUtils.init3dNormalMat(planeMat);

        this.#light.setLight();

        this.gl.drawElements(this.gl.TRIANGLES, this.#plane.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
