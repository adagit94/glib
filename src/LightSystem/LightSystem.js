import SHADERS from "../shaders.js";
import PointLight from "./lights/PointLight/PointLight.js";
import SpotLight from "./lights/SpotLight/SpotLight.js";

class LightSystem {
    constructor(ctx) {
        this.#ctx = ctx;
        this.#gl = ctx.gl;

        ctx.gl.enable(ctx.gl.BLEND);
        ctx.gl.blendFunc(ctx.gl.ONE, ctx.gl.ONE);
        ctx.gl.blendEquation(ctx.gl.FUNC_ADD);

        this.#programs = ctx.createPrograms(
            [
                {
                    name: "spotLight",
                    vShader: SHADERS.spot.vShader,
                    fShader: SHADERS.spot.fShader,
                },
                {
                    name: "spotDepthMap",
                    vShader: SHADERS.spot.depthMap.vShader,
                    fShader: SHADERS.spot.depthMap.fShader,
                },
                {
                    name: "pointLight",
                    vShader: SHADERS.point.vShader,
                    fShader: SHADERS.point.fShader,
                },
                {
                    name: "pointDepthMap",
                    vShader: SHADERS.point.depthMap.vShader,
                    fShader: SHADERS.point.depthMap.fShader,
                },
            ],
            false
        );

        const { spotLight, spotDepthMap, pointLight, pointDepthMap } = this.#programs;

        Object.assign(spotLight.locations, this.#getCommonLightLocations(spotLight.program), {
            finalLightMat: this.#gl.getUniformLocation(spotLight.program, "u_finalLightMat"),
            lightDirection: this.#gl.getUniformLocation(spotLight.program, "u_lightDirection"),
            innerLimit: this.#gl.getUniformLocation(spotLight.program, "u_innerLimit"),
            outerLimit: this.#gl.getUniformLocation(spotLight.program, "u_outerLimit"),
        });
        Object.assign(spotDepthMap.locations, this.#getCommonDepthMapLocations(spotDepthMap.program));

        Object.assign(pointLight.locations, this.#getCommonLightLocations(pointLight.program), {
            far: this.#gl.getUniformLocation(pointLight.program, "u_far"),
        });
        Object.assign(pointDepthMap.locations, this.#getCommonDepthMapLocations(pointDepthMap.program), {
            modelMat: this.#gl.getUniformLocation(pointDepthMap.program, "u_modelMat"),
            lightPosition: this.#gl.getUniformLocation(pointDepthMap.program, "u_lightPosition"),
            far: this.#gl.getUniformLocation(pointDepthMap.program, "u_far"),
        });
    }

    #ctx;
    #gl;
    #programs;
    lights = {};

    #getCommonLightLocations(program) {
        return {
            modelMat: this.#gl.getUniformLocation(program, "u_modelMat"),
            normalMat: this.#gl.getUniformLocation(program, "u_normalMat"),
            lightColor: this.#gl.getUniformLocation(program, "u_lightColor"),
            depthMap: this.#gl.getUniformLocation(program, "u_depthMap"),
            ambientColor: this.#gl.getUniformLocation(program, "u_ambientColor"),
            lightPosition: this.#gl.getUniformLocation(program, "u_lightPosition"),
            cameraPosition: this.#gl.getUniformLocation(program, "u_cameraPosition"),
            shininess: this.#gl.getUniformLocation(program, "u_shininess"),
            distanceConst: this.#gl.getUniformLocation(program, "u_distanceConst"),
            distanceLin: this.#gl.getUniformLocation(program, "u_distanceLin"),
            distanceQuad: this.#gl.getUniformLocation(program, "u_distanceQuad"),
        };
    }

    #getCommonDepthMapLocations(program) {
        return {
            finalLightMat: this.#gl.getUniformLocation(program, "u_finalLightMat"),
        };
    }

    addLight(type, name, depthMapConf, initialUniforms) {
        let light;

        switch (type) {
            case "spot":
                light = new SpotLight(this.#ctx, depthMapConf, initialUniforms);
                break;

            case "point":
                light = new PointLight(this.#ctx, depthMapConf, initialUniforms);
                break;
        }

        this.lights[name] = light;
    }

    renderLights(models) {
        const lights = Object.values(this.lights);

        for (const light of lights) {
            light.prepareLight();
            this.#genDepthMap(models, light);
            this.#setLight(light);
        }
    }

    #genDepthMap = (models, light) => {
        this.#gl.viewport(0, 0, light.depthMap.texture.settings.width, light.depthMap.texture.settings.height);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, light.depthMap.framebuffer);

        let setDepthMap;

        if (light instanceof SpotLight) {
            setDepthMap = this.#setSpotDepthMap;
        } else if (light instanceof PointLight) {
            setDepthMap = this.#setPointDepthMap;
        }

        light.renderModelsToDepthMap(models, setDepthMap);

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.activeTexture(this.#gl[`TEXTURE${light.depthMap.texture.unit}`]);
    };

    #setSpotDepthMap(light) {
        const { spotDepthMap } = this.#programs;

        this.#gl.useProgram(spotDepthMap.program);
        this.#setCommonDepthMapUniforms(spotDepthMap.locations, light);
    }

    #setPointDepthMap(light) {
        const { pointDepthMap } = this.#programs;

        this.#gl.useProgram(pointDepthMap.program);
        this.#setPointDepthMapUniforms(pointDepthMap.locations, light);
    }

    #setCommonDepthMapUniforms(locations, light) {
        this.#gl.uniformMatrix4fv(locations.finalLightMat, false, light.depthMap.uniforms.finalLightMat);
    }

    #setPointDepthMapUniforms(locations, light) {
        this.#setCommonDepthMapUniforms(locations, light);

        this.#gl.uniformMatrix4fv(locations.modelMat, false, light.depthMap.uniforms.modelMat);
        this.#gl.uniform3f(locations.lightPosition, ...light.depthMap.uniforms.lightPosition);
        this.#gl.uniform1f(locations.far, light.depthMap.uniforms.far);
    }

    #setLight(light) {
        let lightProgram;
        let setUniforms;

        if (light instanceof SpotLight) {
            lightProgram = this.#programs.spotLight;
            setUniforms = this.#setSpotUniforms;
        } else if (light instanceof PointLight) {
            lightProgram = this.#programs.pointLight;
            setUniforms = this.#setPointUniforms;
        }

        this.#gl.useProgram(lightProgram.program);
        setUniforms(lightProgram.locations, light);
    }

    #setSpotUniforms(locations, light) {
        this.#setCommonUniforms(locations, light);

        this.#gl.uniformMatrix4fv(locations.finalLightMat, false, light.uniforms.finalLightMat);
        this.#gl.uniform3f(locations.lightDirection, ...light.uniforms.lightDirection);
        this.#gl.uniform1f(locations.innerLimit, light.uniforms.innerLimit);
        this.#gl.uniform1f(locations.outerLimit, light.uniforms.outerLimit);
    }

    #setPointUniforms(locations, light) {
        this.#setCommonUniforms(locations, light);

        this.#gl.uniform1f(locations.far, light.uniforms.far);
    }

    #setCommonUniforms(locations, light) {
        this.#gl.uniform3f(locations.color, ...light.uniforms.color);
        this.#gl.uniformMatrix4fv(locations.finalMat, false, light.uniforms.finalMat);
        this.#gl.uniformMatrix4fv(locations.modelMat, false, light.uniforms.modelMat);
        this.#gl.uniformMatrix4fv(locations.normalMat, false, light.uniforms.normalMat);
        this.#gl.uniform3f(locations.lightColor, ...light.uniforms.lightColor);
        this.#gl.uniform1i(locations.depthMap, light.uniforms.depthMap);
        this.#gl.uniform3f(locations.ambientColor, ...light.uniforms.ambientColor);
        this.#gl.uniform3f(locations.lightPosition, ...light.uniforms.lightPosition);
        this.#gl.uniform3f(locations.cameraPosition, ...light.uniforms.cameraPosition);
        this.#gl.uniform1f(locations.shininess, light.uniforms.shininess);
        this.#gl.uniform1f(locations.distanceConst, light.uniforms.distanceConst ?? 1);
        this.#gl.uniform1f(locations.distanceLin, light.uniforms.distanceLin);
        this.#gl.uniform1f(locations.distanceQuad, light.uniforms.distanceQuad);
    }
}

export default LightSystem;
