import Sequencer from "../Gadgets/Sequencer.js";
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
    #movementSequencer;

    async #initGrid() {
        const cuboidW = 0.5;
        const cuboidH = cuboidW / 4;
        const sideLength = cuboidW + cuboidH;
        const cubeOffset = 2 * sideLength - sideLength / 2;
        const cube = (this.#cube = new SkeletonCube(cuboidW, cuboidH, false));
        const layers = 4;

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

        this.#initMovementSequencer(sideLength);

        const lightOriginOffset = cuboidH / 2 + sideLength + cuboidW / 2;
        const lightOrigin = [-lightOriginOffset, -lightOriginOffset, -lightOriginOffset];

        const light = (this.#light = new PhongLight(this.gl, {
            color: [1, 1, 1],
            lightPosition: lightOrigin,
            lightColor: [1, 1, 0],
            ambientColor: [0.1, 0.1, 0.1],
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
        const { cubes } = this.mats;
        const { buffers } = this.programs.goldenGrid;

        this.#moveCamera();
        this.#moveLight();

        for (const cubeMat of cubes) {
            const { cuboids, cubes } = this.#cube.mats;

            this.gl.bindVertexArray(buffers.cuboid.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.cuboid.indices);

            for (const cuboidPartMat of cuboids) {
                const modelMat = ShaderUtils.mult3dMats(cubeMat, cuboidPartMat);

                this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modelMat);
                this.#light.uniforms.modelMat = modelMat;
                this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

                this.#light.setLight();

                this.gl.drawElements(this.gl.TRIANGLES, this.#cube.cuboid.indices.length, this.gl.UNSIGNED_SHORT, 0);
            }

            this.gl.bindVertexArray(buffers.cube.vao);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.cube.indices);

            for (const cubePartMat of cubes) {
                const modelMat = ShaderUtils.mult3dMats(cubeMat, cubePartMat);

                this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modelMat);
                this.#light.uniforms.modelMat = modelMat;
                this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modelMat);

                this.#light.setLight();

                this.gl.drawElements(this.gl.TRIANGLES, this.#cube.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
            }
        }
    }

    #moveCamera() {
        const posAngle = Math.PI / 2 - this.animData.deltaTime / 8;
        const posR = 6;
        // const cameraPos = [Math.cos(posAngle) * posR, 0, Math.sin(posAngle) * posR]
        const cameraPos = [0, 0, 6];

        const cameraMat = ShaderUtils.lookAtMat(cameraPos);
        const viewMat = ShaderUtils.init3dInvertedMat(cameraMat);

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat);
        this.#light.uniforms.cameraPosition = cameraPos;
    }

    #moveLight() {
        // const posAngle = Math.PI / 2 - this.animData.deltaTime / 4
        const posAngle = -Math.PI / 2;
        const posR = 6;
        const lightPos = [Math.cos(posAngle) * posR, 0, Math.sin(posAngle) * posR];

        // LINEAR TRANSLATION
        // const lightPos = [-4 + this.animData.deltaTime / 8, 0, Math.sin(posAngle) * posR]

        this.#light.uniforms.lightPosition = lightPos;
    }

    #initMovementSequencer(sideLength) {
        this.#movementSequencer = new Sequencer(
            [
                {
                    translation: [0, 0, 3 * sideLength],
                    delay: 0.25,
                },
            ],
            (currentStep, data) => {
                const { lightPosition } = this.#light.uniforms;
                const [lx, ly, lz] = lightPosition;
                const [tx, ty, tz] = currentStep.translation;

                const positionBorderline = [data.lastPos[0] + tx, data.lastPos[1] + ty, data.lastPos[2] + tz];

                const precision = 3;

                const moveX = lx.toFixed(precision) === positionBorderline[0].toFixed(precision);
                const moveY = ly.toFixed(precision) === positionBorderline[1].toFixed(precision);
                const moveZ = lz.toFixed(precision) === positionBorderline[2].toFixed(precision);

                if (!moveX && !moveY && !moveZ) {
                    data.lastPos = [lx, ly, lz];

                    return true;
                }

                const t = this.animData.frameDeltaTime / 100;

                if (moveX) {
                    const tPolarity = tx < 0 ? -1 : 1
                    
                    lightPosition[0] = lx + t * tPolarity;
                }

                if (moveY) {
                    const tPolarity = ty < 0 ? -1 : 1
                    
                    lightPosition[1] = ly + t * tPolarity;
                }

                if (moveZ) {
                    const tPolarity = tz < 0 ? -1 : 1
                    
                    lightPosition[2] = lz + t * tPolarity;
                }
            }
        );

        this.#movementSequencer.customData.lastPos = [...this.#light.lightPosition];
    }

    computeScene = () => {
        this.#renderGrid();
    };
}

export default GoldenGrid;
