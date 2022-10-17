import Light from "../Light.js";

class PointLight extends Light {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf);
    }

    async init(buffersData, initialUniforms) {
        await super.init(
            [
                {
                    name: "light",
                    paths: {
                        vShader: "src/lights/PointLight/pointLight.vert",
                        fShader: "src/lights/PointLight/pointLight.frag",
                    },
                    buffersData,
                },
                {
                    name: "depthMap",
                    paths: {
                        vShader: "src/lights/pointLight/shadowMapping/depthMap.vert",
                        fShader: "src/lights/pointLight/shadowMapping/depthMap.frag",
                    },
                },
            ],
            initialUniforms
        );

        Object.assign(this.program.locations, {
            ambientColor: this.gl.getUniformLocation(this.program.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(this.program.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(this.program.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(this.program.program, "u_shininess"),
        });
        this.program.depthMap.locations = {
            position: this.program.depthMap.locations.position,
            finalMat: this.program.depthMap.locations.finalMat,
            modelMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(this.program.depthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(this.program.depthMap.program, "u_far"),
        };
    }

    setUniforms() {
        super.setUniforms();

        this.gl.uniform3f(this.program.locations.ambientColor, ...this.program.uniforms.ambientColor);
        this.gl.uniform3f(this.program.locations.lightPosition, ...this.program.uniforms.lightPosition);
        this.gl.uniform3f(this.program.locations.cameraPosition, ...this.program.uniforms.cameraPosition);
        this.gl.uniform1f(this.program.locations.shininess, this.program.uniforms.shininess);
    }

    setDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalMat, false, this.program.depthMap.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.modelMat, false, this.program.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.program.depthMap.locations.lightPosition, ...this.program.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.program.depthMap.locations.far, this.program.depthMap.uniforms.far);
    }
}

export default PointLight;
