import SHADERS from "./shaders.js";
import MatUtils from "../utils/MatUtils.js";
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
    #lights = {};
    #models = {};

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

    addLight(type, name, depthMapConf, initialUniforms, settings) {
        let light;

        switch (type) {
            case "spot":
                light = new SpotLight(this.#ctx, depthMapConf, initialUniforms);
                break;

            case "point":
                light = new PointLight(this.#ctx, depthMapConf, initialUniforms);
                break;
        }

        if (settings) light.prepare(settings);

        this.#lights[name] = light;

        delete this.#lights._values;
        this.#lights._values = Object.values(this.#lights);

        return light;
    }

    removeLight(name) {
        delete this.#lights[name];
        
        delete this.#lights._values;
        this.#lights._values = Object.values(this.#lights);
    }

    getLight(name) {
        return this.#lights[name];
    }

    setModels(models, replace) {
        if (replace) {
            this.#models = models;
        } else {
            Object.assign(this.#models, models);
            delete this.#models._values
        }

        this.#models._values = Object.values(this.#models);
    }

    renderLights() {
        for (const light of this.#lights._values) {
            if (light.active) {
                this.#genDepthMap(light);
                this.#genLight(light);
            }
        }
    }

    #genDepthMap = (light) => {
        this.#gl.viewport(0, 0, light.depthMap.texture.settings.width, light.depthMap.texture.settings.height);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, light.depthMap.framebuffer);

        if (light instanceof SpotLight) {
            this.#renderModelsToDepthMap(light, light.depthMap.light.viewMat, this.#setSpotDepthMap);
        } else if (light instanceof PointLight) {
            for (let side = 0; side < 6; side++) {
                this.#gl.framebufferTexture2D(
                    this.#gl.FRAMEBUFFER,
                    this.#gl.DEPTH_ATTACHMENT,
                    this.#gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                    light.depthMap.texture.texture,
                    0
                );
                this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
                this.#renderModelsToDepthMap(light, light.depthMap.light.viewMats[side], this.#setPointDepthMap);
            }
        }

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.activeTexture(this.#gl[`TEXTURE${light.depthMap.texture.unit}`]);
    };

    #setSpotDepthMap = (light) => {
        const { spotDepthMap } = this.#programs;

        this.#gl.useProgram(spotDepthMap.program);

        this.#setCommonDepthMapUniforms(spotDepthMap.locations, light);
    };

    #setPointDepthMap = (light) => {
        const { pointDepthMap } = this.#programs;

        this.#gl.useProgram(pointDepthMap.program);

        this.#setCommonDepthMapUniforms(locations, light);
        this.#gl.uniformMatrix4fv(locations.modelMat, false, light.depthMap.uniforms.modelMat);
        this.#gl.uniform3f(locations.lightPosition, ...light.uniforms.lightPosition);
        this.#gl.uniform1f(locations.far, light.depthMap.uniforms.far);
    };

    #setCommonDepthMapUniforms = (locations, light) => {
        this.#gl.uniformMatrix4fv(locations.finalLightMat, false, light.depthMap.uniforms.finalLightMat);
    };

    #genLight = (light) => {
        let setLight;

        if (light instanceof SpotLight) {
            setLight = this.#setSpot;
        } else if (light instanceof PointLight) {
            setLight = this.#setPoint;
        }

        this.#renderModels(light, setLight);
    };

    #setSpot = (light) => {
        const { spotLight } = this.#programs;

        this.#gl.useProgram(spotLight.program);

        this.#setCommonUniforms(spotLight.locations, light);
        this.#gl.uniformMatrix4fv(spotLight.locations.finalLightMat, false, light.uniforms.finalLightMat);
        this.#gl.uniform3f(spotLight.locations.lightDirection, ...light.uniforms.lightDirection);
        this.#gl.uniform1f(spotLight.locations.innerLimit, light.uniforms.innerLimit);
        this.#gl.uniform1f(spotLight.locations.outerLimit, light.uniforms.outerLimit);
    };

    #setPoint = (light) => {
        const { pointLight } = this.#programs;

        this.#gl.useProgram(pointLight.program);

        this.#setCommonUniforms(pointLight.locations, light);
        this.#gl.uniform1f(pointLight.locations.far, light.uniforms.far);
    };

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

    #renderModels = (light, setLight) => {
        for (const model of this.#models._values) {
            const matSets = Array.isArray(model.mats) ? model.mats : [model.mats];

            for (const matSet of matSets) {
                light.uniforms.finalMat = matSet.final;
                light.uniforms.modelMat = matSet.model;
                light.uniforms.normalMat = MatUtils.normal3d(matSet.model);
                light.uniforms.finalLightMat = light.depthMap.uniforms.finalLightMat; // not needed in case of point light

                setLight(light);
                model.render();
            }
        }
    };

    #renderModelsToDepthMap = (light, lightMat, setDepthMap) => {
        for (const model of this.#models._values) {
            const matSets = Array.isArray(model.mats) ? model.mats : [model.mats];
            
            for (const matSet of matSets) {
                light.depthMap.uniforms.finalLightMat = MatUtils.multMats3d(lightMat, matSet.model);
                light.depthMap.uniforms.modelMat = matSet.model; // not needed in case of spot light

                setDepthMap(light);
                model.render();
            }
        }
    };
}

export default LightSystem;
