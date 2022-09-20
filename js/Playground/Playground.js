import PhongLight from "../Lights/PhongLight/PhongLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";
import Hexagon from "../Shapes/3d/Hexagon/Hexagon.js";
import Plane from "../Shapes/3d/Plane.js";

class Playground extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 1, far: 5 });

        this.#initData();
    }

    #light;
    #geometry;

    async #initData() {
        const wireframe = false;
        // const geometry = new Plane(0.1, 4, 4, wireframe);
        const geometry = new Cube(0.5, wireframe);

        this.#geometry = geometry;

        const cameraPosition = [0, 0, 2.5];
        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat); // Math.PI / 2

        const light = (this.#light = new PhongLight(this.gl, {
            ambientColor: [0, 0, 0],
            color: [0, 0, 1],
            lightPosition: [0, 0, 2.5],
            lightColor: [1, 1, 1],
            cameraPosition,
            shininess: 256,
        }));

        await light.init();
        await this.init([
            {
                name: "playground",
                paths: { vShader: "js/Playground/playground.vert", fShader: "js/Playground/playground.frag" },
                buffersData: {
                    geometry: {
                        vertices: [light.getPositionLocation(), geometry.vertices],
                        indices: geometry.indices, // !wireframe && plane.indices,-
                        normals: [light.getNormalLocation(), geometry.normals],
                    },
                },
            },
        ]);

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    computeScene = () => {
        // const geometryMat = ShaderUtils.init3dRotationMat("y", 0); // this.animData.deltaTime / 2
        const modelMat = ShaderUtils.init3dRotationMat("y", Math.PI / 32); // -Math.PI / 16

        // const modelMat = ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(0, 0, -0.5), [
        //     ShaderUtils.init3dRotationMat("y", -Math.PI / 32),
        //     // ShaderUtils.init3dRotationMat("x", -Math.PI / 2),
        // ]);

        this.gl.bindVertexArray(this.programs.playground.buffers.geometry.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.geometry.indices);

        this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modelMat);
        this.#light.uniforms.modelMat = modelMat;
        this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

        this.#light.setLight();

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
