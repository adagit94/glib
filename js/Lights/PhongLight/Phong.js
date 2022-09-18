import Light from "../Light.js";

class PhongLight extends Light {
    constructor(gl, initialUniforms) {
        super(gl);

        this.uniforms = initialUniforms;
    }

    async init() {
        await super.init({
            vShader: "js/Lights/PhongLight/phongLight.vert",
            fShader: "js/Lights/PhongLight/phongLight.frag",
        });

        this.locations = {
            position: this.gl.getAttribLocation(program, "a_position"),
            normal: this.gl.getAttribLocation(program, "a_normal"),
            color: this.gl.getUniformLocation(program, "u_color"),
            finalMat: this.gl.getUniformLocation(program, "u_finalMat"),
            modelMat: this.gl.getUniformLocation(program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(program, "u_normalMat"),
            ambientColor: this.gl.getUniformLocation(program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(program, "u_lightPosition"),
            lightColor: this.gl.getUniformLocation(program, "u_lightColor"),
            cameraPosition: this.gl.getUniformLocation(program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(program, "u_shininess"),
        };
    }

    setUniforms() {
        this.gl.uniform3f(this.locations.color, ...this.uniforms.color);
        this.gl.uniformMatrix4fv(this.locations.finalMat, false, this.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.locations.modelMat, false, this.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.locations.normalMat, false, this.uniforms.normalMat);
        this.gl.uniform3f(this.locations.ambientColor, ...this.uniforms.ambientColor);
        this.gl.uniform3f(this.locations.lightPosition, ...this.uniforms.lightPosition);
        this.gl.uniform3f(this.locations.lightColor, ...this.uniforms.lightColor);
        this.gl.uniform3f(this.locations.cameraPosition, ...this.uniforms.cameraPosition);
        this.gl.uniform1f(this.locations.shininess, this.uniforms.shininess);
    }
}

export default PhongLight;
