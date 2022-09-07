import Shader from "../../../Shader/Shader.js";
import ShaderUtils from "../../../Shader/ShaderUtils.js";
import HexagonUtils from "./HexagonUtils.js";

class Hexagon extends Shader {
    constructor() {
        super("3d", { fov: Math.PI / 4, near: 1, far: 4 });

        ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Shapes/3d/Hexagon/hexagon.vert",
            fShader: "js/Shapes/3d/Hexagon/hexagon.frag",
        }).then((program) => {
            this.gl.useProgram(program);

            this.#program = program;
            this.#locations = { ...this.initCommonLocations([program])[0] };
            this.#uniforms = {
                color: [0, 0, 1],
            };
            this.#mats = {
                scene: ShaderUtils.mult3dMats(this.projectionMat, [
                    ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 3])),
                    ShaderUtils.init3dTranslationMat(0, 0, 0),
                ]),
            };
            this.#conf = {};

            const hexagonData = HexagonUtils.getHexagonalPlateData();

            this.#storage = { hexagonData };

            const vao = (this.#vao = this.gl.createVertexArray());

            this.gl.bindVertexArray(vao);

            this.#buffers = {
                vertices: this.createAndBindVerticesBuffer(this.#locations.position, hexagonData.vertices, { size: 3 }),
                indices: this.createAndBindIndicesBuffer(hexagonData.indices),
                // normals: this.createAndBindVerticesBuffer(this.#locations.normal, hexagon.normals, { size: 3 }),
            };

            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LESS);
            this.gl.clearDepth(1);

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

    #renderPlates() {
        // ShaderUtils.rotate3d(this.#mats.scene, "y", Math.PI / 2); // - Math.PI / 4
        ShaderUtils.rotate3d(this.#mats.scene, "x", 0);

        this.gl.bindVertexArray(this.#vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);

        this.gl.uniform3f(this.#locations.color, ...this.#uniforms.color);
        this.gl.uniformMatrix4fv(this.#locations.mat, false, this.#mats.scene);

        this.gl.drawElements(this.gl.TRIANGLES, this.#storage.hexagonData.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    computeScene() {
        this.#renderPlates();
    }
}

export default Hexagon;
