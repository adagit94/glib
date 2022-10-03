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
        };

        program.depthMap.locations = {
            position: program.depthMap.locations.position,
            modelMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_modelMat"),
            lightMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_lightMat"),
        };

        this.uniforms = initialUniforms;
    }

    setUniforms() {
        this.gl.uniform3f(this.program.locations.color, ...this.uniforms.color);
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, this.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, this.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, this.uniforms.normalMat);
        this.gl.uniform3f(this.program.locations.lightColor, ...this.uniforms.lightColor);
    }

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }
}

export default Light;
