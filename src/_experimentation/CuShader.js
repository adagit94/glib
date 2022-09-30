import Generator from "../Generator/Generator.js";
import ShaderUtils from "../utils/MatUtils.js";

export default class CuShader extends Generator {
    static #cubeCorners = ["bottomLeft"]; // "topRight" , "bottomRight", "topLeft"
    static #curvesPerCorner = 5; // , "topRight", "bottomRight", "topLeft"

    static #getCubeData = () => {
        const vertices = new Float32Array([
            // FRONT
            0.75, 0.75, 0.75, 0.75, -0.75, 0.75, -0.75, -0.75, 0.75, -0.75, 0.75, 0.75,

            // BACK
            0.75, 0.75, -0.75, 0.75, -0.75, -0.75, -0.75, -0.75, -0.75, -0.75, 0.75, -0.75,
        ]);

        const indices = new Uint16Array([
            // FRONT
            0, 1, 1, 2, 2, 3, 3, 0,

            // BACK
            4, 5, 5, 6, 6, 7, 7, 4,

            // TOP
            0, 4, 3, 7,

            // BOTTOM
            2, 6, 1, 5,
        ]);

        return [vertices, indices];
    };

    static #getCrossChannelData = () => {
        const verticesArcCount = 100;
        const arcRad = Math.PI;
        const radStep = arcRad / verticesArcCount;
        const origin = 0.5;
        const baseRadius = 0.15;

        let coordinates = [];

        for (let cornerI = 0; cornerI < CuShader.#cubeCorners.length; cornerI++) {
            const corner = CuShader.#cubeCorners[cornerI];

            for (let curve = 0, r = baseRadius; curve < CuShader.#curvesPerCorner; r /= 1.25, curve++) {
                const o = origin;

                for (let i = 0, rad = 0, secondHalfMult = 1; i < verticesArcCount; rad += radStep, i++) {
                    let x;
                    let y;
                    let z;

                    switch (corner) {
                        case "bottomLeft":
                            x = o + Math.cos(rad) * r;
                            y = x * -1;
                            z = o * -1 - Math.sin(rad) * r;
                            break;

                        case "topRight":
                            x = -o - Math.cos(rad) * r;
                            y = x * -1;
                            z = o + Math.sin(rad) * r;
                            break;
                    }

                    if (rad > Math.PI / 2) {
                        const mult = 1 - secondHalfMult / 1000;

                        z *= mult;

                        if (curve !== 0) {
                            x *= mult;
                        }
                    }

                    coordinates.push(x, y, z);
                }
            }
        }

        return new Float32Array(coordinates);
    };

    constructor(shaders) {
        super();

        this.init(shaders).then((programs) => {
            const [cube, crossChannel] = programs;

            this.#cube = {
                program: cube,
            };

            this.#crossChannel = {
                program: crossChannel,
            };

            this.#initLocations(programs);
            this.#initObjectsData();

            this.requestAnimationFrame();
        });
    }

    #cu = {
        projectionMat: ShaderUtils.initPerspectiveMat(Math.PI / 2, this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, 0.1, 2000),
    };

    #cube;
    #crossChannel;

    #animData = {
        sceneYRotation: 0,
    };

    #initLocations = (programs) => {
        const [cubeLocations, crossChannelLocations] = this.initCommonLocations(programs);

        this.#cube.locations = {
            ...cubeLocations,
        };

        this.#crossChannel.locations = {
            ...crossChannelLocations,
        };
    };

    #initObjectsData = () => {
        const [cubeVertices, cubeIndices] = CuShader.#getCubeData();

        this.#cube.vao = this.gl.createVertexArray();
        this.#crossChannel.vao = this.gl.createVertexArray();

        this.gl.bindVertexArray(this.#cube.vao);

        this.#cube.vertices = cubeVertices;
        this.#cube.indices = cubeIndices;
        this.#cube.buffers = {
            vertices: this.createAndBindVerticesBuffer(this.#cube.locations.position, cubeVertices, { size: 3 }),
            elements: this.createAndBindIndicesBuffer(cubeIndices),
        };
        this.#cube.mat = ShaderUtils.init3dIdentityMat();

        const crossChannelVertices = CuShader.#getCrossChannelData();

        this.gl.bindVertexArray(this.#crossChannel.vao);

        this.#crossChannel.vertices = crossChannelVertices;
        this.#crossChannel.buffers = {
            vertices: this.createAndBindVerticesBuffer(this.#crossChannel.locations.position, crossChannelVertices, { size: 3 }),
        };
        this.#crossChannel.mats = [ShaderUtils.init3dTranslationMat(0.75, -0.75, 0.75), ShaderUtils.init3dTranslationMat(0.2, 0, 0.5)];

        ShaderUtils.rotate3d(this.#crossChannel.mats[0], "y", -Math.PI);
        // ShaderUtils.rotate3d(this.#crossChannel.mats[0], "x", -Math.PI / 2);
        // ShaderUtils.rotate3d(this.#crossChannel.mats[0], "z", Math.PI / 16);
        // ShaderUtils.rotate3d(this.#crossChannel.mats[1], "y", -Math.PI / 2);
        // ShaderUtils.rotate3d(this.#crossChannel.mats[1], "x", -Math.PI / 3.42);
        // ShaderUtils.rotate3d(this.#crossChannel.mats[1], "z", Math.PI / 16);

        // ShaderUtils.scale(this.#crossChannel.bottomLeftMat, { d: 1.5, });
        // ShaderUtils.scale(this.#crossChannel.topRightMat, { d: 1.5, });
    };

    #computeView() {
        let lookAtMat = ShaderUtils.lookAtMat([0.75, 0.5, -0.5], [0.75, -0.75, 0.75]);

        ShaderUtils.translate3d(lookAtMat, { y: 0 });

        // this.#animData.sceneYRotation += this.animData.deltaTime / 10;
        ShaderUtils.rotate3d(lookAtMat, "y", Math.PI / 1.8); // this.#animData.sceneYRotation

        this.#cu.viewMat = ShaderUtils.mult3dMats(this.#cu.projectionMat, lookAtMat);
    }

    #renderCube = () => {
        const mat = ShaderUtils.mult3dMats(this.#cu.viewMat, this.#cube.mat);

        this.#crossChannel.cubeMat = mat;

        this.gl.useProgram(this.#cube.program);
        this.gl.bindVertexArray(this.#cube.vao);
        this.gl.uniformMatrix4fv(this.#cube.locations.mat, false, mat);

        this.gl.drawElements(this.gl.LINES, this.#cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };

    #renderCrossChannel = () => {
        this.gl.useProgram(this.#crossChannel.program);
        this.gl.bindVertexArray(this.#crossChannel.vao);

        const singleCrossChannelCurveVerticesCount =
            this.#crossChannel.vertices.length / CuShader.#cubeCorners.length / CuShader.#curvesPerCorner / 3;

        const cornerMats = [
            ShaderUtils.mult3dMats(this.#crossChannel.cubeMat ?? this.#cu.viewMat, this.#crossChannel.mats[0]),
            ShaderUtils.mult3dMats(this.#crossChannel.cubeMat ?? this.#cu.viewMat, this.#crossChannel.mats[1]),
        ];

        for (let corner = 0; corner < CuShader.#cubeCorners.length; corner++) {
            for (let curve = 0; curve < CuShader.#curvesPerCorner; curve++) {
                this.gl.uniformMatrix4fv(this.#crossChannel.locations.mat, false, cornerMats[corner]);

                this.gl.drawArrays(
                    this.gl.LINE_STRIP,
                    (corner * CuShader.#curvesPerCorner + curve) * singleCrossChannelCurveVerticesCount,
                    singleCrossChannelCurveVerticesCount - 1
                );
            }
        }
    };

    renderScene = () => {
        this.#computeView();
        // this.#renderCube();
        this.#renderCrossChannel();
    };
}
