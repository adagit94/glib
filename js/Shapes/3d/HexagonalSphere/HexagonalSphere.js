import Shader from "../../../Shader/Shader.js";
import ShaderUtils from "../../../Shader/ShaderUtils.js";
import HexagonalSphereUtils from "./HexagonalSphereUtils.js";

class HexagonalSphere extends Shader {
    constructor(settings) {
        super("3d", { fov: Math.PI / 4, near: 0, far: 2000 });

        ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Shapes/3d/HexagonalSphere/hexagonalSphere.vert",
            fShader: "js/Shapes/3d/HexagonalSphere/hexagonalSphere.frag",
        }).then((program) => {
            this.gl.useProgram(program);

            this.#program = program;
            this.#locations = { ...this.initCommonLocations([program])[0] };
            this.#uniforms = {
                color: [0, 0, 1],
            };
            this.#mats = {
                scene: ShaderUtils.mult3dMats(this.projectionMat, ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2.5]))),
            };

            const plateData = HexagonalSphereUtils.getHexagonalPlateData(settings);

            this.#storage = { plateData };

            const vao = (this.#vao = this.gl.createVertexArray());

            this.gl.bindVertexArray(vao);

            this.#buffers = {
                vertices: this.createAndBindVerticesBuffer(this.#locations.position, plateData.vertices, { size: 3 }),
                indices: this.createAndBindIndicesBuffer(plateData.indices),
                // normals: this.createAndBindVerticesBuffer(this.#locations.normal, hexagon.normals, { size: 3 }),
            };

            this.#initPlatesMats();
            this.requestAnimationFrame();
        });
    }

    #program;
    #locations;
    #uniforms;
    #mats;
    #vao;
    #buffers;
    #conf;
    #storage;

    #initPlatesMats() {
        const plates = 10;
        const angle = Math.PI * 2;
        const angleStep = angle / plates;
        const circleR = 0.5;
        const scale = (circleR * 13) / plates;

        this.#conf = {
            plates,
        };

        let mats = (this.#mats.plates = []);

        const scaleMat = ShaderUtils.init3dScaleMat(scale, scale, scale);

        for (let plate = 0, angle = angleStep; plate < plates; angle += angleStep, plate++) {
            const y = Math.sin(angle) * circleR;
            const z = -Math.cos(angle) * circleR;

            const plateMat = ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(0, y, z), [
                ShaderUtils.init3dRotationMat("x", -angle),
                scaleMat,
            ]);

            mats.push(plateMat);
        }

        // const sideAngle = (Math.PI / 4) * side;
        const sideMat = ShaderUtils.mult3dMats(ShaderUtils.init3dRotationMat("y",  Math.PI / 5), ShaderUtils.init3dRotationMat("x", angleStep / 2));

        for (let plate = 0, angle = angleStep; plate < plates; angle += angleStep, plate++) {
            const y = Math.sin(angle) * circleR;
            const z = -Math.cos(angle) * circleR;

            const plateMat = ShaderUtils.mult3dMats(sideMat, [
                ShaderUtils.init3dTranslationMat(0, y, z),
                ShaderUtils.init3dRotationMat("x", -angle),
                scaleMat,
            ]);

            // const plateMat = ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(0, y, z), [
            //     ShaderUtils.init3dRotationMat("x", -angle),
            //     scaleMat,
            // ]);


            mats.push(plateMat);
        }
    }

    #renderPlates() {
        // ShaderUtils.rotate3d(this.#mats.scene, "x", Math.PI / 2);
        ShaderUtils.rotate3d(this.#mats.scene, "y", Math.PI / 8);
        const { plates } = this.#conf;
        const { plateData } = this.#storage;

        this.gl.bindVertexArray(this.#vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);

        this.gl.uniform3f(this.#locations.color, ...this.#uniforms.color);

        for (let side = 0; side < 2; side++) {
            for (let plate = 0; plate < plates; plate++) {
                const plateMat = ShaderUtils.mult3dMats(this.#mats.scene, this.#mats.plates[side * plates + plate]);

                this.gl.uniformMatrix4fv(this.#locations.mat, false, plateMat);

                this.gl.drawElements(this.gl.LINES, plateData.indices.length, this.gl.UNSIGNED_SHORT, 0);
            }
        }
    }

    computeScene() {
        this.#renderPlates();
    }
}

export default HexagonalSphere;
