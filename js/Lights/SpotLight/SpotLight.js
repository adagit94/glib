import ShaderUtils from "../../Shader/ShaderUtils.js";

class SpotLight {
    constructor(canvasSelector, conf) {
        const gl = (this.#gl = document.querySelector(canvasSelector).getContext("webgl2"));

        this.uniforms = {
            finalMat: conf.finalMat,
            color: conf.color,
            modelMat: conf.modelMat,
            normalMat: conf.normalMat,
            lightPosition: conf.lightPosition,
            cameraPosition: conf.cameraPosition,
            lightTarget: conf.lightTarget,
            lightColor: conf.lightColor,
            lightInnerBorder: conf.lightInnerBorder,
            lightOuterBorder: conf.lightOuterBorder,
            lightShininess: conf.lightShininess,
        };

        this.program = ShaderUtils.createShaderProgram(gl, {
            vShader: "js/Lights/SpotLight/spotLight.vert",
            fShader: "js/Lights/SpotLight/spotLight.frag",
        }).then((program) => {
            this.program = program;

            this.#locations = {
                position: gl.getAttribLocation(program, "a_position"),
                normal: gl.getAttribLocation(program, "a_normal"),
                finalMat: gl.getUniformLocation(program, "u_finalMat"),
                color: gl.getUniformLocation(program, "u_color"),
                modelMat: gl.getUniformLocation(program, "u_objectToLight"),
                normalMat: gl.getUniformLocation(program, "u_normalMat"),
                cameraPosition: gl.getUniformLocation(program, "u_cameraPosition"),
                lightPosition: gl.getUniformLocation(program, "u_lightPosition"),
                lightDirection: gl.getUniformLocation(program, "u_lightDirection"),
                lightInnerBorder: gl.getUniformLocation(program, "u_lightInnerBorder"),
                lightOuterBorder: gl.getUniformLocation(program, "u_lightOuterBorder"),
                lightColor: gl.getUniformLocation(program, "u_lightColor"),
                lightShininess: gl.getUniformLocation(program, "u_lightShininess"),
            };
        });
    }

    program;
    uniforms;
    #gl;
    #locations;

    #setUniforms() {
        const lookAt = ShaderUtils.lookAtMat(this.uniforms.lightPosition, this.uniforms.lightTarget);

        this.#gl.uniformMatrix4fv(this.#locations.finalMat, false, this.uniforms.finalMat);
        this.#gl.uniform3f(this.#locations.color, ...this.uniforms.color);
        this.#gl.uniform3f(this.#locations.lightDirection, -lookAt[8], -lookAt[9], -lookAt[10]);
        this.#gl.uniform3f(this.#locations.lightPosition, ...this.uniforms.lightPosition);
        this.#gl.uniform3f(this.#locations.lightColor, ...this.uniforms.lightColor);
        this.#gl.uniform1f(this.#locations.lightInnerBorder, Math.cos(this.uniforms.lightInnerBorder));
        this.#gl.uniform1f(this.#locations.lightOuterBorder, Math.cos(this.uniforms.lightOuterBorder));
        this.#gl.uniform1f(this.#locations.lightShininess, this.uniforms.lightShininess);
        this.#gl.uniform3f(this.#locations.cameraPosition, ...this.uniforms.cameraPosition);
        this.#gl.uniformMatrix4fv(this.#locations.modelMat, false, this.uniforms.modelMat);
        this.#gl.uniformMatrix4fv(this.#locations.normalMat, false, this.uniforms.normalMat);
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

export default SpotLight;
