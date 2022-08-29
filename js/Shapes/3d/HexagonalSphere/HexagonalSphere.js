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
            this.gl.useProgram(program)
            
            this.#program = program;
            this.#locations = { ...this.initCommonLocations([program])[0] };
            this.#mats = {
                scene: ShaderUtils.mult3dMats(this.projectionMat, ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 1]))),
            };

            const vao = (this.#vao = this.gl.createVertexArray());

            this.gl.bindVertexArray(vao);

            const plateData = HexagonalSphereUtils.getHexagonalPlateData(settings)
            
            this.#buffers = {
                vertices: this.createAndBindVerticesBuffer(this.#locations.position, plateData.vertices, { size: 3 }),
                indices: this.createAndBindIndicesBuffer(plateData.indices),
                // normals: this.createAndBindVerticesBuffer(this.#locations.normal, hexagon.normals, { size: 3 }),
            };
    
            this.#uniforms = {
                color: [0, 0, 1],
            };

            this.#storage = {
                hexagonalPlate: plateData,
            }

            this.requestAnimationFrame();
        });
    }

    #program;
    #locations;
    #uniforms;
    #mats;
    #vao;
    #buffers;
    #storage;

    #renderPlates() {
        // ShaderUtils.rotate3d(this.#mats.scene, "x", Math.PI / 8);
        // ShaderUtils.rotate3d(this.#mats.scene, "y", Math.PI);

        this.gl.bindVertexArray(this.#vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);

        this.gl.uniformMatrix4fv(this.#locations.mat, false, this.#mats.scene);
        this.gl.uniform3f(this.#locations.color, ...this.#uniforms.color);

        this.gl.drawElements(this.gl.LINES, this.#storage.hexagonalPlate.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    computeScene() {
        this.#renderPlates();
    };
}

export default HexagonalSphere;
