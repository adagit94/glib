import ShaderUtils from "../../Shader/ShaderUtils.js";

class SpotLight {
    constructor(canvasSelector, conf) {
        const gl = (this.#gl = document.querySelector(canvasSelector).getContext("webgl2"));

        this.uniformsSources = {
            finalMat: conf.finalMat,
            color: conf.color,
            objectToLightMat: conf.objectToLightMat,
            objectToLightInversedTransposedMat: conf.objectToLightInversedTransposedMat,
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
                objectToLightMat: gl.getUniformLocation(program, "u_objectToLight"),
                objectToLightInversedTransposedMat: gl.getUniformLocation(program, "u_objectToLightInversedTransposedMat"),
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
    uniformsSources;
    #gl;
    #locations;

    #setUniforms() {
        const lookAt = ShaderUtils.lookAtMat(this.uniformsSources.lightPosition, this.uniformsSources.lightTarget);

        this.#gl.uniformMatrix4fv(this.#locations.finalMat, false, this.uniformsSources.finalMat);
        this.#gl.uniform3f(this.#locations.color, ...this.uniformsSources.color);
        this.#gl.uniform3f(this.#locations.lightDirection, -lookAt[8], -lookAt[9], -lookAt[10]);
        this.#gl.uniform3f(this.#locations.lightPosition, ...this.uniformsSources.lightPosition);
        this.#gl.uniform3f(this.#locations.lightColor, ...this.uniformsSources.lightColor);
        this.#gl.uniform1f(this.#locations.lightInnerBorder, Math.cos(this.uniformsSources.lightInnerBorder));
        this.#gl.uniform1f(this.#locations.lightOuterBorder, Math.cos(this.uniformsSources.lightOuterBorder));
        this.#gl.uniform1f(this.#locations.lightShininess, this.uniformsSources.lightShininess);
        this.#gl.uniform3f(this.#locations.cameraPosition, ...this.uniformsSources.cameraPosition);
        this.#gl.uniformMatrix4fv(this.#locations.objectToLightMat, false, this.uniformsSources.objectToLightMat);
        this.#gl.uniformMatrix4fv(this.#locations.objectToLightInversedTransposedMat, false, this.uniformsSources.objectToLightInversedTransposedMat);
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
