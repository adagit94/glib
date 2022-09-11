import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";
import Hexagon from "../Shapes/3d/Hexagon/Hexagon.js";

class Playground extends Shader {
    constructor() {
        super("3d", { fov: Math.PI / 4, near: 0, far: 20 });

        this.animate = false;

        this.#init();
    }

    #program;
    #mats;
    #locations;
    #data;

    #init = async () => {
        this.#program = await ShaderUtils.createShaderProgram(this.gl, {
            vShader: "js/Playground/playground.vert",
            fShader: "js/Playground/playground.frag",
        });

        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat([0, 0, 2]));

        this.#mats = {
            scene: ShaderUtils.mult3dMats(this.projectionMat, viewMat),
        };

        this.#locations = this.initCommonLocations([this.#program])[0];

        this.#initData();

        this.requestAnimationFrame();
    };

    #initData() {
        const cube = new Cube(0.5, true)
        const vao = this.gl.createVertexArray();

        this.gl.bindVertexArray(vao);

        this.#data = {
            cube,
            vao,
            color: [1, 1, 1],
            buffers: {
                vertices: this.createAndBindVerticesBuffer(this.#locations.position, cube.vertices, { size: 3 }),
                indices: this.createAndBindIndicesBuffer(cube.indices),
                normals: this.createAndBindVerticesBuffer(this.#locations.normal, cube.normals, { size: 3 }),
            },
        };
    }

    #render() {
        this.gl.uniform3f(this.#locations.color, ...this.#data.color);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#data.buffers.indices);
        
        this.gl.drawElemens(this.gl.LINES, this.#data.cube.indices.length, this.gl.UNSIGNED_SHORT, 0)
    }

    computeScene() {
        this.gl.useProgram(this.#program);
        this.#render();
    }
}

export default Playground;
