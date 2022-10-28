import SHADERS from "./shaders.js";

class Light {
    constructor(ctx, type, name, depthMapConf, initialUniforms) {
        this.gl = ctx.gl;

        ctx.createPrograms([
            {
                name,
                vShader: SHADERS[type].vShader,
                fShader: SHADERS[type].fShader,
            },
            {
                name: `${name}DepthMap`,
                vShader: SHADERS[type].depthMap.vShader,
                fShader: SHADERS[type].depthMap.fShader,
            },
        ]);

        const lightProgData = ctx.programs[name];

        this.program = lightProgData.program;
        this.locations = {
            ...lightProgData.locations,
            modelMat: this.gl.getUniformLocation(this.program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(this.program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(this.program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(this.program, "u_depthMap"),
            ambientColor: this.gl.getUniformLocation(this.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(this.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(this.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(this.program, "u_shininess"),
            distanceConst: this.gl.getUniformLocation(this.program, "u_distanceConst"),
            distanceLin: this.gl.getUniformLocation(this.program, "u_distanceLin"),
            distanceQuad: this.gl.getUniformLocation(this.program, "u_distanceQuad"),
        };
        this.uniforms = initialUniforms.light;

        const depthMapProgData = ctx.programs[`${name}DepthMap`];
        const texBindTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
        const texTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP_POSITIVE_X : this.gl.TEXTURE_2D;

        this.depthMap = {
            program: depthMapProgData.program,
            locations: {
                position: depthMapProgData.locations.position,
                finalLightMat: this.gl.getUniformLocation(depthMapProgData.program, "u_finalLightMat"),
            },
            uniforms: initialUniforms.depthMap,
            texture: ctx.createTexture({
                name: `${name}DepthMap`,
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
            }),
            light: { projectionMat: depthMapConf.lightProjectionMat },
        };
        this.depthMap.framebuffer = ctx.createFramebuffer({
            name: `${name}DepthMap`,
            setTexture: () => {
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, texTarget, this.depthMap.texture.texture, 0);
                this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
            },
        });
        this.uniforms.depthMap = this.depthMap.texture.unit;
    }

    program;
    gl;
    locations;
    uniforms;
    depthMap;

    setUniforms() {
        this.gl.uniform3f(this.locations.color, ...this.uniforms.color);
        this.gl.uniformMatrix4fv(this.locations.finalMat, false, this.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.locations.modelMat, false, this.uniforms.modelMat);
        this.gl.uniformMatrix4fv(this.locations.normalMat, false, this.uniforms.normalMat);
        this.gl.uniform3f(this.locations.lightColor, ...this.uniforms.lightColor);
        this.gl.uniform1i(this.locations.depthMap, this.uniforms.depthMap);
        this.gl.uniform3f(this.locations.ambientColor, ...this.uniforms.ambientColor);
        this.gl.uniform3f(this.locations.lightPosition, ...this.uniforms.lightPosition);
        this.gl.uniform3f(this.locations.cameraPosition, ...this.uniforms.cameraPosition);
        this.gl.uniform1f(this.locations.shininess, this.uniforms.shininess);
        this.gl.uniform1f(this.locations.distanceConst, this.uniforms.distanceConst ?? 1);
        this.gl.uniform1f(this.locations.distanceLin, this.uniforms.distanceLin);
        this.gl.uniform1f(this.locations.distanceQuad, this.uniforms.distanceQuad);
    }

    setLight() {
        this.gl.useProgram(this.program);
        this.setUniforms();
    }

    renderDepthMap = (models) => {
        this.gl.viewport(0, 0, this.depthMap.texture.settings.width, this.depthMap.texture.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthMap.framebuffer);
        
        this.renderModelsToDepthMap(models);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.activeTexture(this.gl[`TEXTURE${this.depthMap.texture.unit}`]);
    };

    setDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.depthMap.locations.finalLightMat, false, this.depthMap.uniforms.finalLightMat);
    }

    setDepthMap() {
        this.gl.useProgram(this.depthMap.program);
        this.setDepthMapUniforms();
    }
}

export default Light;
