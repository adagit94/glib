import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf);
    }

    program;
    uniforms;

    async init(programConf, initialUniforms) {
        let program = (this.program = (await super.init([programConf]))[programConf.name]);

        this.uniforms = initialUniforms;

        program.locations = {
            ...program.locations,
            modelMat: this.gl.getUniformLocation(this.program.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(this.program.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(this.program.program, "u_lightColor"),
        };
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
    };
}

export default Light;
