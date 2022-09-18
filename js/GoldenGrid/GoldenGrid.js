import SpecularLight from "../Lights/SpecularLight/SpecularLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";

class GoldenGrid extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 2, near: 0, far: 20 });

        this.#initGrid();
    }

    #cube;
    #light;

    async #initGrid() {
        const sideLength = 0.5;
        const cubeOffset = sideLength * 2 - sideLength / 2;
        const cubeData = (this.#cube = new Cube(sideLength, true));
        const layers = 4;

        const light = (this.#light = new SpecularLight(this.gl, {
            color: [1, 1, 0],
            lightPosition: [0, 0, 0.25],
            lightColor: [1, 1, 1],
        }));

        await light.init();
        await this.init([
            {
                name: "goldenGrid",
                paths: { vShader: "js/GoldenGrid/goldenGrid.vert", fShader: "js/GoldenGrid/goldenGrid.frag" },
                buffersData: {
                    cubes: {
                        vertices: [light.getPositionLocation(), cubeData.vertices],
                        indices: cubeData.indices,
                        normals: [light.getNormalLocation(), cubeData.normals],
                    },
                },
            },
        ]);

        const { goldenGrid } = this.programs;

        this.gl.useProgram(goldenGrid.program);

        const cameraMat = ShaderUtils.lookAtMat([0, 0, 3]);
        const viewMat = ShaderUtils.init3dInvertedMat(cameraMat);
        const sceneMat = ShaderUtils.mult3dMats(this.mats.projection, viewMat);

        this.mats.scene = sceneMat;

        let mats = [];

        for (let z = cubeOffset, zLayer = 0; zLayer < layers; z -= sideLength, zLayer++) {
            for (let y = cubeOffset, yLayer = 0; yLayer < layers; y -= sideLength, yLayer++) {
                for (let x = cubeOffset, xLayer = 0; xLayer < layers; x -= sideLength, xLayer++) {
                    const cubePositionMat = ShaderUtils.init3dTranslationMat(x, y, z);

                    mats.push(cubePositionMat);
                }
            }
        }

        this.mats.cubes = mats;

        this.animate = false;

        // this.gl.enable(this.gl.DEPTH_TEST);
        // this.gl.clearDepth(0);

        this.requestAnimationFrame();
    }

    #renderGrid() {
        const { scene: sceneMat, cubes: cubesMats } = this.mats;
        const { vao: cubesVao, indices: cubesIndices } = this.programs.goldenGrid.buffers.cubes;

        this.gl.bindVertexArray(cubesVao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubesIndices);

        const rotationMat = ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 2);

        for (let cube = 0; cube < cubesMats.length; cube++) {
            const cubeMat = ShaderUtils.mult3dMats(cubesMats[cube], rotationMat);

            this.#light.uniformsSources.finalMat = ShaderUtils.mult3dMats(sceneMat, cubeMat);
            this.#light.uniformsSources.objectToLightMat = cubeMat;

            this.#light.setLight();

            this.gl.drawElements(this.gl.LINES, this.#cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
        }
    }

    computeScene = () => {
        this.#renderGrid();
    };
}

export default GoldenGrid;
