import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(conf) {
        super(conf);
    }

    program;

    async init(lightType, conf, initialUniforms) {
        await super.init({
            ...conf,
            programs: [
                ...(conf.programs ?? []),
                {
                    name: "light",
                    paths: {
                        vShader: `src/lights/${lightType}/pointLight.vert`,
                        fShader: `src/lights/${lightType}/pointLight.frag`,
                    },
                },
                {
                    name: "depthMap",
                    paths: {
                        vShader: `src/lights/${lightType}/shadowMapping/depthMap.vert`,
                        fShader: `src/lights/${lightType}/shadowMapping/depthMap.frag`,
                    },
                },
            ],
        });

        this.program = this.programs.light;
        this.program.locations = {
            ...this.program.locations,
            modelMat: this.gl.getUniformLocation(this.program.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(this.program.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(this.program.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(this.program.program, "u_depthMap"),
            far: this.gl.getUniformLocation(this.program.program, "u_far"),
            ambientColor: this.gl.getUniformLocation(this.program.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(this.program.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(this.program.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(this.program.program, "u_shininess"),
        };
        this.program.uniforms = initialUniforms.light;

        this.program.depthMap = this.programs.depthMap;
        this.program.depthMap.uniforms = initialUniforms.depthMap;
        this.program.depthMap.locations = {
            position: this.program.depthMap.locations.position,
            finalLightMat: this.gl.getUniformLocation(this.program.depthMap.program, "u_finalLightMat"),
        };
    }

    setUniforms() {
        this.gl.uniform3f(this.program.locations.color, ...this.program.uniforms.color);
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, this.program.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, this.program.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, this.program.uniforms.normalMat);
        this.gl.uniform3f(this.program.locations.lightColor, ...this.program.uniforms.lightColor);
        this.gl.uniform1i(this.program.locations.depthMap, this.program.uniforms.depthMap);
        this.gl.uniform1f(this.program.locations.far, this.program.uniforms.far);
        this.gl.uniform3f(this.program.locations.ambientColor, ...this.program.uniforms.ambientColor);
        this.gl.uniform3f(this.program.locations.lightPosition, ...this.program.uniforms.lightPosition);
        this.gl.uniform3f(this.program.locations.cameraPosition, ...this.program.uniforms.cameraPosition);
        this.gl.uniform1f(this.program.locations.shininess, this.program.uniforms.shininess);
    }

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }

    renderDepthMap = (models) => {
        const { depthMap } = this.program;

        this.gl.viewport(0, 0, depthMap.texture.settings.width, depthMap.texture.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, depthMap.framebuffer);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        this.renderModelsToDepthMap(models)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.activeTexture(this.gl[`TEXTURE${depthMap.texture.unit}`]);
    };
    
    setDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, this.program.depthMap.uniforms.finalLightMat);
    }

    setDepthMap() {
        this.gl.useProgram(this.program.depthMap.program);
        this.setDepthMapUniforms();
    }
}

export default Light;
