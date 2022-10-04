import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf);
    }

    program;
    uniforms;

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
            lightMat: this.gl.getUniformLocation(this.program.program, "u_lightMat"),
            lightColor: this.gl.getUniformLocation(this.program.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(this.program.program, "u_depthMap"),
        };

        program.depthMap.locations = {
            position: program.depthMap.locations.position,
            finalLightMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_finalLightMat"),
        };

        this.uniforms = initialUniforms;
    }

    setUniforms() {
        this.gl.uniform3f(this.program.locations.color, ...this.uniforms.color);
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, this.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, this.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, this.uniforms.normalMat);
        this.gl.uniformMatrix4fv(this.program.locations.lightMat, false, this.uniforms.lightMat);
        this.gl.uniform3f(this.program.locations.lightColor, ...this.uniforms.lightColor);
        this.gl.uniform1i(this.program.locations.depthMap, this.uniforms.depthMap);
    }

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }
}

export default Light;
