import Framer from "../Framer/Framer.js";

class Light extends Framer {
    constructor(conf) {
        super(conf);
    }

    program;

    async init(lightType, conf, depthMapConf, initialUniforms) {
        await super.init({
            ...conf,
            programs: [
                ...(conf.programs ?? []),
                {
                    name: "light",
                    paths: {
                        vShader: `src/lights/${lightType}/light.vert`,
                        fShader: `src/lights/${lightType}/light.frag`,
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

        const program = this.program = this.programs.light;
        const depthMap = program.depthMap = this.programs.depthMap;

        program.locations = {
            ...program.locations,
            modelMat: this.gl.getUniformLocation(program.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(program.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(program.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(program.program, "u_depthMap"),
            far: this.gl.getUniformLocation(program.program, "u_far"),
            ambientColor: this.gl.getUniformLocation(program.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(program.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(program.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(program.program, "u_shininess"),
            distanceConst: this.gl.getUniformLocation(program.program, "u_distanceConst"),
            distanceLin: this.gl.getUniformLocation(program.program, "u_distanceLin"),
            distanceQuad: this.gl.getUniformLocation(program.program, "u_distanceQuad"),
        };
        program.uniforms = initialUniforms.light;
        
        depthMap.uniforms = initialUniforms.depthMap;
        depthMap.locations = {
            position: program.depthMap.locations.position,
            finalLightMat: this.gl.getUniformLocation(program.depthMap.program, "u_finalLightMat"),
        };
        depthMap.light = { projectionMat: depthMapConf.lightProjectionMat };

        const texBindTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D
        const texTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP_POSITIVE_X : this.gl.TEXTURE_2D
        
        depthMap.texture = this.createTexture({
            name: "depthMap",
            settings: {
                cubeMap: depthMapConf.cubeMap,
                width: depthMapConf.size,
                height: depthMapConf.size,
                internalFormat: this.gl.DEPTH_COMPONENT32F,
                format: this.gl.DEPTH_COMPONENT,
                type: this.gl.FLOAT,
                bindTarget: texBindTarget,
                texTarget,
            },
            setParams: () => {
                this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_COMPARE_MODE, this.gl.COMPARE_REF_TO_TEXTURE);
            },
        });
        depthMap.framebuffer = this.createFramebuffer({
            name: "depthMap",
            bindTexture: () => {
                this.gl.framebufferTexture2D(
                    this.gl.FRAMEBUFFER,
                    this.gl.DEPTH_ATTACHMENT,
                    texTarget,
                    depthMap.texture.texture,
                    0
                );
            },
        });

        program.uniforms.depthMap = depthMap.texture.unit;
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
        this.gl.uniform1f(this.program.locations.distanceConst, this.program.uniforms.distanceConst ?? 1);
        this.gl.uniform1f(this.program.locations.distanceLin, this.program.uniforms.distanceLin);
        this.gl.uniform1f(this.program.locations.distanceQuad, this.program.uniforms.distanceQuad);
    }

    setLight() {
        this.gl.useProgram(this.program.program);
        this.setUniforms();
    }

    renderDepthMap = (models) => {
        const { depthMap } = this.program;

        this.gl.viewport(0, 0, depthMap.texture.settings.width, depthMap.texture.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, depthMap.framebuffer);

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
