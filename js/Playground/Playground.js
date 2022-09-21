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
        const wireframe = true;
        // const geometry = new Plane(0.1, 4, 4, wireframe);
        const innerCube = new Cube(0.5, { wireframe, invertedNormals: true });
        const outerCube = new Cube(0.6, { wireframe });

        this.#geometry = {innerCube, outerCube};

        const cameraPosition = [0, 0, 2.5];
        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat); // Math.PI / 2

        const light = (this.#light = new PhongLight(this.gl, {
            ambientColor: [0, 0, 0.25],
            color: [0, 0, 1],
            lightPosition: [0, 0, 1],
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
                    innerCube: {
                        vertices: [light.getPositionLocation(), innerCube.vertices],
                        indices: innerCube.indices, // !wireframe && plane.indices,-
                        normals: [light.getNormalLocation(), innerCube.normals],
                    },
                    outerCube: {
                        vertices: [light.getPositionLocation(), outerCube.vertices],
                        indices: outerCube.indices, // !wireframe && plane.indices,-
                        normals: [light.getNormalLocation(), outerCube.normals],
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
        // const modelMat = ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 2);
        const modelMat = ShaderUtils.init3dRotationMat("y", -Math.PI / 8);
        // const modelMat = ShaderUtils.init3dRotationMat("y", 0);

        // const modelMat = ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(0, 0, -0.5), [
        //     ShaderUtils.init3dRotationMat("y", -Math.PI / 32),
        //     // ShaderUtils.init3dRotationMat("x", -Math.PI / 2),
        // ]);

        this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modelMat);
        this.#light.uniforms.modelMat = modelMat;
        this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

        this.#light.setLight();

        this.gl.bindVertexArray(this.programs.playground.buffers.innerCube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.innerCube.indices);

        this.gl.drawElements(this.gl.LINES, this.#geometry.innerCube.indices.length, this.gl.UNSIGNED_SHORT, 0);

        this.gl.bindVertexArray(this.programs.playground.buffers.outerCube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.outerCube.indices);

        this.gl.drawElements(this.gl.LINES, this.#geometry.outerCube.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
