import Light from "../Light.js";

class Phong extends Light {
    constructor(gl, initialUniforms) {
        super(gl);

        this.uniforms = initialUniforms;

        this.#ambientActive = initialUniforms.ambient ? 1 : 0;
        this.#diffuseActive = initialUniforms.diffuse ? 1 : 0;
        this.#specularActive = initialUniforms.specular ? 1 : 0;
    }

    #ambientActive;
    #diffuseActive;
    #specularActive;

    async init() {
        await super.init({
            vShader: "js/Lights/Phong/phong.vert",
            fShader: "js/Lights/Phong/phong.frag",
        });

        this.locations = {
            position: this.gl.getAttribLocation(program, "a_position"),
            normal: this.gl.getAttribLocation(program, "a_normal"),
            color: this.gl.getUniformLocation(program, "u_color"),
            finalMat: this.gl.getUniformLocation(program, "u_finalMat"),
            modelMat: this.gl.getUniformLocation(program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(program, "u_normalMat"),
            ambient: {
                active: this.gl.getUniformLocation(program, "u_ambientActive"),
                color: this.gl.getUniformLocation(program, "u_ambientColor"),
            },
            diffuse: {
                active: this.gl.getUniformLocation(program, "u_diffuseActive"),
                position: this.gl.getUniformLocation(program, "u_diffusePosition"),
                color: this.gl.getUniformLocation(program, "u_diffuseColor"),
            },
            specular: {
                active: this.gl.getUniformLocation(program, "u_specularActive"),
                position: this.gl.getUniformLocation(program, "u_specularPosition"),
                color: this.gl.getUniformLocation(program, "u_specularColor"),
                cameraPosition: this.gl.getUniformLocation(program, "u_specularCameraPosition"),
                shininess: this.gl.getUniformLocation(program, "u_specularShininess"),
            },
        };

        this.gl.uniform1i(this.locations.ambient.active, this.#ambientActive);
        this.gl.uniform1i(this.locations.diffuse.active, this.#diffuseActive);
        this.gl.uniform1i(this.locations.specular.active, this.#specularActive);
    }

    setUniforms() {
        this.gl.uniform3f(this.locations.color, ...this.uniforms.color);
        this.gl.uniformMatrix4fv(this.locations.finalMat, false, this.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.locations.modelMat, false, this.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.locations.normalMat, false, this.uniforms.normalMat);

        if (this.#ambientActive) {
            this.gl.uniform3f(this.locations.ambient.color, ...this.uniforms.ambient.color);
        }

        if (this.#diffuseActive) {
            this.gl.uniform3f(this.locations.diffuse.position, ...this.uniforms.diffuse.position);
            this.gl.uniform3f(this.locations.diffuse.color, ...this.uniforms.diffuse.color);
        }

        if (this.#specularActive) {
            this.gl.uniform3f(this.locations.specular.position, ...this.uniforms.specular.position);
            this.gl.uniform3f(this.locations.specular.color, ...this.uniforms.specular.color);
            this.gl.uniform3f(this.locations.specular.cameraPosition, ...this.uniforms.specular.cameraPosition);
            this.gl.uniform1f(this.locations.specular.shininess, this.uniforms.specular.shininess);
        }
    }
}

export default Phong;
