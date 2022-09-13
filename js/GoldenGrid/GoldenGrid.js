import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";

class GoldenGrid extends Shader {
    constructor() {
        super("3d", { fov: Math.PI / 2, near: 0, far: 2000 });

        this.initShaders({
            goldenGrid: {
                vShader: "js/GoldenGrid/goldenGrid.vert",
                fShader: "js/GoldenGrid/goldenGrid.frag",
            },
        }).then((programs) => {
            const [goldenGrid] = programs;

            this.#programs = {
                goldenGrid,
            };

            this.gl.useProgram(goldenGrid);

            const cameraMat = ShaderUtils.lookAtMat();
            const viewMat = ShaderUtils.init3dInvertedMat(cameraMat);
            const sceneMat = ShaderUtils.mult3dMats(this.projectionMat, viewMat);

            this.#mats = {
                scene: sceneMat,
            };

            this.#locations = this.initCommonLocations(programs)[0];

            this.#initGrid();

            this.animate = false;

            this.gl.enable(this.gl.DEPTH_TEST);

            this.requestAnimationFrame();
        });
    }

    #programs;
    #locations;
    #buffers;
    #mats;
    #vao;
    #cube;

    #initGrid() {
        const sideLength = 0.25;
        const cubeOffset = sideLength * 2 - sideLength / 2;
        const cubeData = (this.#cube = new Cube(sideLength, true));
        const layers = 4;
        let mats = [];

        for (let z = cubeOffset, zLayer = 0; zLayer < layers; z -= sideLength, zLayer++) {
            for (let y = cubeOffset, yLayer = 0; yLayer < layers; y -= sideLength, yLayer++) {
                for (let x = cubeOffset, xLayer = 0; xLayer < layers; x -= sideLength, xLayer++) {
                    const cubePositionMat = ShaderUtils.init3dTranslationMat(x, y, z);

                    mats.push(ShaderUtils.mult3dMats(this.#mats.scene, cubePositionMat));
                }
            }
        }

        this.#mats = {
            cubes: mats,
        };

        const vao = (this.#vao = this.gl.createVertexArray());

        this.gl.bindVertexArray(vao);

        this.#buffers = {
            vertices: this.createAndBindVerticesBuffer(this.#locations.position, cubeData.vertices, { size: 3 }),
            indices: this.createAndBindIndicesBuffer(cubeData.indices),
            // normals: this.createAndBindVerticesBuffer(this.#locations.normal, cubeData.normals, { size: 3 }),
        };

        this.gl.uniform3f(this.#locations.color, 1, 1, 0);
    }

    #renderGrid() {
        const cubesMats = this.#mats.cubes;

        this.gl.bindVertexArray(this.#vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);

        this.gl.uniformMatrix4fv(this.#locations.mat, false, this.#mats.scene);
        this.gl.drawElements(this.gl.LINES, this.#cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
        
        // for (let cube = 0; cube < cubesMats.length; cube++) {
        //     const cubeMat = cubesMats[cube];

        //     this.gl.uniformMatrix4fv(this.#locations.mat, false, cubeMat);

        //     this.gl.drawElements(this.gl.LINES, this.#cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
        // }
    }

    computeScene = () => {
        this.#renderGrid();
        // this.#renderEdgeLight()
    };
}

export default GoldenGrid;
