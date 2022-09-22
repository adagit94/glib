import PhongLight from "../Lights/PhongLight/PhongLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";

class GoldenGrid extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 2, near: 1, far: 10 });

        this.#initGrid();
    }

    #cubes = {};
    #light;

    async #initGrid() {
        const sideLength = 0.5;
        const cubeOffset = sideLength * 2 - sideLength / 2;
        const innerCube = (this.#cubes.inner = new Cube(sideLength, { wireframe: true, invertedNormals: true }));
        const outerCube = (this.#cubes.outer = new Cube(sideLength + 0.001, { wireframe: true }));
        const layers = 4;

        const cameraPosition = [0, 0, 3];
        const cameraMat = ShaderUtils.lookAtMat(cameraPosition);
        const viewMat = ShaderUtils.init3dInvertedMat(cameraMat);
        const sceneMat = ShaderUtils.mult3dMats(this.mats.projection, viewMat);

        this.mats.scene = sceneMat;

        let cubeMats = [];

        for (let z = cubeOffset, zLayer = 0; zLayer < layers; z -= sideLength, zLayer++) {
            for (let y = cubeOffset, yLayer = 0; yLayer < layers; y -= sideLength, yLayer++) {
                for (let x = cubeOffset, xLayer = 0; xLayer < layers; x -= sideLength, xLayer++) {
                    const cubePositionMat = ShaderUtils.init3dTranslationMat(x, y, z);

                    cubeMats.push(cubePositionMat);
                }
            }
        }

        const light = (this.#light = new PhongLight(this.gl, {
            color: [1, 1, 1],
            lightPosition: [0, 1, 2.5],
            lightColor: [1, 1, 1],
            ambientColor: [0, 0, 0],
            cameraPosition,
            shininess: 256,
        }));

        await light.init();
        await this.init([
            {
                name: "goldenGrid",
                paths: { vShader: "js/GoldenGrid/goldenGrid.vert", fShader: "js/GoldenGrid/goldenGrid.frag" },
                buffersData: {
                    innerCube: {
                        vertices: [light.locations.position, innerCube.vertices],
                        indices: innerCube.indices,
                        normals: [light.locations.normal, innerCube.normals],
                    },
                    outerCube: {
                        vertices: [light.locations.position, outerCube.vertices],
                        indices: outerCube.indices,
                        normals: [light.locations.normal, outerCube.normals],
                    },
                },
            },
        ]);

        this.mats.cubes = cubeMats;

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    #renderGrid() {
        const { scene: sceneMat, cubes: cubesMats } = this.mats;
        const { buffers } = this.programs.goldenGrid;

        // const rotationMat = ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 2);
        // const sceneRotationMat = ShaderUtils.init3dRotationMat("y", Math.PI / 2);
        const sceneRotationMat = ShaderUtils.init3dRotationMat("y", 0);

        for (let cube = 0; cube < cubesMats.length; cube++) {
            const cubeMat = cubesMats[cube]

            this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(sceneMat, [sceneRotationMat, cubeMat]);
            this.#light.uniforms.modelMat = cubeMat;
            this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(cubeMat);
            this.#light.uniforms.lightPosition = [Math.cos(this.animData.deltaTime / 4) * 2.5, 1, Math.sin(this.animData.deltaTime / 4) * 2.5]
            this.#light.uniforms.color = [0, 0, 1]

            this.#light.setLight();

            this.gl.bindVertexArray(buffers.innerCube.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.innerCube.indices);

            this.gl.drawElements(this.gl.LINES, this.#cubes.inner.indices.length, this.gl.UNSIGNED_SHORT, 0);

            this.#light.uniforms.color = [0, 1, 0]
            this.#light.setLight();

            this.gl.bindVertexArray(buffers.outerCube.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.outerCube.indices);

            this.gl.drawElements(this.gl.LINES, this.#cubes.outer.indices.length, this.gl.UNSIGNED_SHORT, 0);
        }
    }

    computeScene = () => {
        this.#renderGrid();
    };
}

export default GoldenGrid;
