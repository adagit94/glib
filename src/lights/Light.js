import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(conf) {
        super(conf);
    }

    program;

    async init(conf, initialUniforms) {
        await super.init(conf);

        this.program = this.programs.light
        this.program.locations = {
            ...this.program.locations,
            modelMat: this.gl.getUniformLocation(this.program.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(this.program.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(this.program.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(this.program.program, "u_depthMap"),
            far: this.gl.getUniformLocation(this.program.program, "u_far"),
        };
        this.program.uniforms = initialUniforms.light;

        this.program.depthMap = this.programs.depthMap
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

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }

    setDepthMap() {
        this.gl.useProgram(this.program.depthMap.program);
        this.setDepthMapUniforms();
    }
}

export default Light;
