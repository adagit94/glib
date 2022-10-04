import Light from "../Light.js";

class PhongLight extends Light {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf);
    }

    async init(buffersData, initialUniforms) {
        await super.init(
            {
                name: "phongLight",
                paths: {
                    vShader: "src/lights/PhongLight/phongLight.vert",
                    fShader: "src/lights/PhongLight/phongLight.frag",
                },
                buffersData,
            },
            initialUniforms
        );

        Object.assign(this.program.locations, {
            ambientColor: this.gl.getUniformLocation(this.program.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(this.program.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(this.program.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(this.program.program, "u_shininess"),
        });
    }

    setUniforms() {
        super.setUniforms()

        this.gl.uniform3f(this.program.locations.ambientColor, ...this.uniforms.ambientColor);
        this.gl.uniform3f(this.program.locations.lightPosition, ...this.uniforms.lightPosition);
        this.gl.uniform3f(this.program.locations.cameraPosition, ...this.uniforms.cameraPosition);
        this.gl.uniform1f(this.program.locations.shininess, this.uniforms.shininess); 
    }
}

export default PhongLight;
