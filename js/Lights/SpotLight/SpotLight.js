import ShaderUtils from "../../Shader/ShaderUtils";

class SpotLight {
    constructor(canvasSelector, conf, frameHandler) {
        const gl = (this.#gl = document.querySelector(canvasSelector).getContext("webgl2"));
        const program = (this.#program = ShaderUtils.createShaderProgram(gl, {
            vShader: "./spotLight.vert",
            fShader: "./spotLight.frag",
        }));

        this.#locations = {
            position: gl.getAttribLocation(program, "a_position"),
            normal: gl.getAttribLocation(program, "a_normal"),
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

        this.#uniforms = {
            color: conf.color,
            objectToLightMat: conf.objectToLightMat,
            objectToLightInversedTransposedMat: conf.objectToLightInversedTransposedMat,
            lightPosition: conf.ligthPosition,
            cameraPosition: conf.cameraPosition,
            lightLookAt: ShaderUtils.lookAtMat(conf.lightPosition, conf.lightTarget),
            lightColor: conf.lightColor,
            lightInnerBorder: conf.lightInnerBorder,
            lightOuterBorder: conf.lightOuterBorder,
            lightShininess: conf.lightShininess,
        };

        this.#frameHandler = frameHandler;
    }

    #gl;
    #program;
    #locations;
    #uniforms;
    #frameHandler;

    #setUniforms() {
        this.#gl.uniform3f(
            this.#locations.lightDirection,
            -this.#uniforms.lightLookAt[8],
            -this.#uniforms.lightLookAt[9],
            -this.#uniforms.lightLookAt[10]
        );
        this.#gl.uniform3f(this.#locations.lightPosition, ...this.#uniforms.lightPosition);
        this.#gl.uniform3f(this.#locations.lightColor, ...this.#uniforms.lightColor);
        this.#gl.uniform1f(this.#locations.lightInnerBorder, this.#uniforms.lightInnerBorder);
        this.#gl.uniform1f(this.#locations.lightOuterBorder, this.#uniforms.lightOuterBorder);
        this.#gl.uniform1f(this.#locations.lightShininess, this.#uniforms.lightShininess);
        this.#gl.uniform3f(this.#locations.cameraPosition, ...this.#uniforms.cameraPosition);
        this.#gl.uniformMatrix4fv(this.#locations.objectToLightMat, false, this.#uniforms.objectToLightMat);
        this.#gl.uniformMatrix4fv(this.#locations.objectToLightInversedTransposedMat, false, this.#uniforms.objectToLightInversedTransposedMat);
    }

    getPositionLocation() {
        return this.#locations.position
    }

    getNormalLocation() {
        return this.#locations.normal
    }

    renderLight = () => {
        this.#gl.useProgram(this.#program);
        this.#frameHandler?.(this.#uniforms);
        this.#setUniforms();
    };
}

export default SpotLight;
