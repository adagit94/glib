import Shader from "../../../Shader/Shader";
import HexagonalSphereUtils from "./HexagonalSphereUtils";

class HexagonalSphere extends Shader {
    constructor(settings) {
        ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Shapes/3d/hexagonalSphere.vert",
            fShader: "js/Shapes/3d/hexagonalSphere.frag",
        }).then((program) => {
            this.#program = program;
            this.#locations = { ...this.initCommonLocations([this.#program])[0] };
            this.#mats = {
                scene: ShaderUtils.mult3dMats(this.projectionMat, ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2]))),
            };

            const vao = (this.vao = this.gl.createVertexArray());

            this.gl.bindVertexArray(vao);

            const plateData = HexagonalSphereUtils.getHexagonalPlateData(settings)
        
            
            // this.#buffers = {
            //     vertices: this.createAndBindVerticesBuffer(this.#locations.position, hexagon.coordinates, { size: 3 }),
            //     indices: this.createAndBindIndicesBuffer(hexagon.indices),
            //     // normals: this.createAndBindVerticesBuffer(this.#locations.normal, hexagon.normals, { size: 3 }),
            // };
    
            this.#uniforms = {
                color: [0, 0, 1],
            };

            this.requestAnimationFrame();
        });
    }

    #program;
    #mats;
    #vao;
    #buffers;
    #uniforms;

    #renderPlates() {
        // const { vao, object, buffers, color } = this.#data;

        // ShaderUtils.rotate3d(this.#mats.scene, "x", Math.PI / 8);
        // ShaderUtils.rotate3d(this.#mats.scene, "y", Math.PI / 3);

        // this.gl.bindVertexArray(vao);
        // this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // this.gl.uniformMatrix4fv(this.#locations.mat, false, this.#mats.scene);
        // this.gl.uniform3f(this.#locations.color, ...color);

        // this.gl.drawElements(this.gl.LINES, object.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    computeScene = () => {
        this.#renderPlates();
    };
}

export default HexagonalSphere;
