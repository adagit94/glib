import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf);
    }

    program;

    async init(programConf, initialUniforms) {
        const programs = (this.program = await super.init([
            programConf,
            {
                name: "depthMap",
                paths: {
                    vShader: "src/lights/shadowMapping/depthMap.vert",
                    fShader: "src/lights/shadowMapping/depthMap.frag",
                },
            },
        ]));

        let program = (this.program = programs[programConf.name]);

        program.depthMap = programs.depthMap

        program.locations = {
            ...program.locations,
            modelMat: this.gl.getUniformLocation(this.program.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(this.program.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(this.program.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(this.program.program, "u_depthMap"),
            far: this.gl.getUniformLocation(this.program.program, "u_far"),
        };

        program.depthMap.locations = {
            position: program.depthMap.locations.position,
            finalMat: program.depthMap.locations.finalMat,
            modelMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(this.program.depthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(this.program.depthMap.program, "u_far"),
        };

        this.program.uniforms = initialUniforms.light;
        this.program.depthMap.uniforms = initialUniforms.depthMap;
    }

    setUniforms() {
        this.gl.uniform3f(this.program.locations.color, ...this.program.uniforms.color);
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, this.program.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, this.program.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, this.program.uniforms.normalMat);
        this.gl.uniform3f(this.program.locations.lightColor, ...this.program.uniforms.lightColor);
        this.gl.uniform1i(this.program.locations.depthMap, this.program.uniforms.depthMap);
        this.gl.uniform1f(this.program.locations.far, this.program.uniforms.far);
    }

    #setDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalMat, false, this.program.depthMap.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.modelMat, false, this.program.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.program.depthMap.locations.lightPosition, ...this.program.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.program.depthMap.locations.far, this.program.depthMap.uniforms.far);
    }

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }

    setDepthMap() {
        this.gl.useProgram(this.program.depthMap.program);
        this.#setDepthMapUniforms();
    }
}

export default Light;
