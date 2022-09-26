import PhongLight from "../Lights/PhongLight/PhongLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import SkeletonCube from "../Shapes/3d/SkeletonCube.js";

class GoldenGrid extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 0.1, far: 100 });

        this.#initGrid();
    }

    #cube;
    #light;

    async #initGrid() {
        const cuboidW = 0.5;
        const cuboidH = cuboidW / 4;
        const sideLength = cuboidW + cuboidH;
        const cubeOffset = 2 * sideLength - sideLength / 2;
        const cube = (this.#cube = new SkeletonCube(cuboidW, cuboidH, false));
        const layers = 4;

        // const cameraPosition = [Math.cos(Math.PI / 2) * 6, 0, Math.sin(Math.PI / 2) * 6];
        const cameraPosition = [0, 0, 6];
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

        this.mats.cubes = cubeMats;

        const light = (this.#light = new PhongLight(this.gl, {
            color: [1, 1, 0],
            lightPosition: cameraPosition,
            lightPosition: [0, 0, 3],
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
                    cuboid: {
                        vertices: [light.locations.position, cube.cuboid.vertices],
                        indices: cube.cuboid.indices,
                        normals: [light.locations.normal, cube.cuboid.normals],
                    },
                    cube: {
                        vertices: [light.locations.position, cube.cube.vertices],
                        indices: cube.cube.indices,
                        normals: [light.locations.normal, cube.cube.normals],
                    },
                },
            },
        ]);

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    #renderGrid() {
        const { scene, cubes } = this.mats;
        const { buffers } = this.programs.goldenGrid;

        let cube = 0
        
        for (const cubeMat of cubes) {
            if (cube > 32) break
            
            const { cuboids, cubes } = this.#cube.mats;

            this.gl.bindVertexArray(buffers.cuboid.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.cuboid.indices);
            
            for (const cuboidPartMat of cuboids) {
                const modelMat = ShaderUtils.mult3dMats(cubeMat, cuboidPartMat);

                this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(scene, modelMat);
                this.#light.uniforms.modelMat = modelMat;
                this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

                this.#light.setLight();

                this.gl.drawElements(this.gl.TRIANGLES, this.#cube.cuboid.indices.length, this.gl.UNSIGNED_SHORT, 0);
            }

            this.gl.bindVertexArray(buffers.cube.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.cube.indices);

            for (const cubePartMat of cubes) {
                const modelMat = ShaderUtils.mult3dMats(cubeMat, cubePartMat);

                this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(scene, modelMat);
                this.#light.uniforms.modelMat = modelMat;
                this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

                this.#light.setLight();

                this.gl.drawElements(this.gl.TRIANGLES, this.#cube.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
            }

            cube++
        }
    }

    computeScene = () => {
        this.#renderGrid();
    };
}

export default GoldenGrid;
