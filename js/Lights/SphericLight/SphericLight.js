import ShaderUtils from "../../Shader/ShaderUtils.js";

class SphericLight {
    constructor(canvasSelector, conf) {
        const gl = (this.#gl = document.querySelector(canvasSelector).getContext("webgl2"));

        this.uniformsSources = {
            finalMat: conf.finalMat,
            color: conf.color,
            objectToLightMat: conf.objectToLightMat,
            lightPosition: conf.lightPosition,
            lightColor: conf.lightColor,
        };

        this.program = ShaderUtils.createShaderProgram(gl, {
            vShader: "js/Lights/SphericLight/sphericLight.vert",
            fShader: "js/Lights/SphericLight/sphericLight.frag",
        }).then((program) => {
            this.program = program;

            this.#locations = {
                position: gl.getAttribLocation(program, "a_position"),
                normal: gl.getAttribLocation(program, "a_normal"),
                finalMat: gl.getUniformLocation(program, "u_finalMat"),
                color: gl.getUniformLocation(program, "u_color"),
                objectToLightMat: gl.getUniformLocation(program, "u_objectToLightMat"),
                lightPosition: gl.getUniformLocation(program, "u_lightPosition"),
                lightColor: gl.getUniformLocation(program, "u_lightColor"),
            };
        });
    }

    program;
    uniformsSources;
    #gl;
    #locations;

    #setUniforms() {
        this.#gl.uniformMatrix4fv(this.#locations.finalMat, false, this.uniformsSources.finalMat);
        this.#gl.uniform3f(this.#locations.color, ...this.uniformsSources.color);
        this.#gl.uniform3f(this.#locations.lightPosition, ...this.uniformsSources.lightPosition);
        this.#gl.uniform3f(this.#locations.lightColor, ...this.uniformsSources.lightColor);
        this.#gl.uniformMatrix4fv(this.#locations.objectToLightMat, false, this.uniformsSources.objectToLightMat);
    }

    getPositionLocation() {
        return this.#locations.position;
    }

    getNormalLocation() {
        return this.#locations.normal;
    }

    renderLight = () => {
        this.#gl.useProgram(this.program);
        this.#setUniforms();
    };
}

export default SphericLight;
