import SHADERS from "./shaders.js";
import PointLight from "./lights/PointLight/PointLight.js";
import SpotLight from "./lights/SpotLight/SpotLight.js";
import LightSystemUtils from "./LightSystemUtils.js";

class LightSystem {
    constructor(ctx, conf) {
        this.#ctx = ctx;
        this.#gl = ctx.gl;
        this.#transparency = !!conf?.transparency;
        this.#shadows = !this.#transparency && !!conf?.shadows;
        this.#programs = ctx.createPrograms([
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
        ]);

        const { spotLight, spotDepthMap, pointLight, pointDepthMap } = this.#programs;

        Object.assign(spotLight.locations, this.#getCommonLightLocations(spotLight.program), {
            finalLightMat: this.#gl.getUniformLocation(spotLight.program, "u_finalLightMat"),
            lightDirection: this.#gl.getUniformLocation(spotLight.program, "u_lightDirection"),
            innerLimit: this.#gl.getUniformLocation(spotLight.program, "u_innerLimit"),
            outerLimit: this.#gl.getUniformLocation(spotLight.program, "u_outerLimit"),
        });
        Object.assign(spotDepthMap.locations, { finalLightMat: this.#gl.getUniformLocation(spotDepthMap.program, "u_finalLightMat") });

        Object.assign(pointLight.locations, this.#getCommonLightLocations(pointLight.program), {
            far: this.#gl.getUniformLocation(pointLight.program, "u_far"),
        });
        Object.assign(pointDepthMap.locations, {
            finalLightMat: this.#gl.getUniformLocation(pointDepthMap.program, "u_finalLightMat"),
            modelMat: this.#gl.getUniformLocation(pointDepthMap.program, "u_modelMat"),
            lightPosition: this.#gl.getUniformLocation(pointDepthMap.program, "u_lightPosition"),
            far: this.#gl.getUniformLocation(pointDepthMap.program, "u_far"),
        });

        if (this.#transparency) {
            ctx.gl.enable(ctx.gl.BLEND);
            ctx.gl.blendFuncSeparate(ctx.gl.SRC_ALPHA, ctx.gl.ONE_MINUS_SRC_ALPHA, ctx.gl.ONE, ctx.gl.ZERO);
            ctx.gl.blendEquation(ctx.gl.FUNC_ADD);
        } else {
            ctx.gl.enable(ctx.gl.DEPTH_TEST);
            ctx.gl.depthFunc(ctx.gl.LEQUAL);

            if (this.#shadows) {
                this.#programs.spotDepthMap.depthMap = this.#initDepthMap(conf.depthMap, ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_2D);
                this.#programs.pointDepthMap.depthMap = this.#initDepthMap(
                    conf.depthMap,
                    ctx.gl.TEXTURE_CUBE_MAP,
                    ctx.gl.TEXTURE_CUBE_MAP_POSITIVE_X
                );
            }
        }
    }

    #ctx;
    #gl;
    #programs;
    #transparency;
    #shadows;
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
            lightDistanceLin: this.#gl.getUniformLocation(program, "u_lightDistanceLin"),
            lightDistanceQuad: this.#gl.getUniformLocation(program, "u_lightDistanceQuad"),
            cameraDistanceLin: this.#gl.getUniformLocation(program, "u_cameraDistanceLin"),
            cameraDistanceQuad: this.#gl.getUniformLocation(program, "u_cameraDistanceQuad"),
            shadows: this.#gl.getUniformLocation(program, "u_shadows"),
            transparency: this.#gl.getUniformLocation(program, "u_transparency"),
        };
    }

    addLight(type, name, conf, initialUniforms) {
        let light;

        switch (type) {
            case "spot":
                light = new SpotLight(conf, initialUniforms);
                break;

            case "point":
                light = new PointLight(conf, initialUniforms);
                break;
        }

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

    renderLights() {
        const lights = this.#lights._values;

        for (const light of lights) {
            if (light.active) {
                if (this.#transparency) {
                    LightSystemUtils.sortModels({ models: this.#models._values, origin: light.uniforms.lightPosition });
                } else if (this.#shadows) {
                    this.#genDepthMap(light);
                }

                this.#genLight(light);
            }
        }
    }

    #genLight = (light) => {
        let setLight;
        let prepareUniforms;

        if (light instanceof SpotLight) {
            setLight = this.#setSpotLight;
            prepareUniforms = LightSystemUtils.prepareSpotUniforms;
        } else if (light instanceof PointLight) {
            setLight = this.#setPointLight;
            prepareUniforms = LightSystemUtils.preparePointUniforms;
        }

        this.#renderModels(light, prepareUniforms, setLight);
    };

    #setSpotLight = (light) => {
        const { spotLight, spotDepthMap } = this.#programs;

        this.#gl.useProgram(spotLight.program);
        this.#setCommonLightUniforms(spotLight.locations, {
            ...light.uniforms,
            depthMap: spotDepthMap.depthMap?.texture.unit,
        });
        this.#gl.uniformMatrix4fv(spotLight.locations.finalLightMat, false, light.uniforms.finalLightMat);
        this.#gl.uniform3f(spotLight.locations.lightDirection, ...light.uniforms.lightDirection);
        this.#gl.uniform1f(spotLight.locations.innerLimit, light.uniforms.innerLimit);
        this.#gl.uniform1f(spotLight.locations.outerLimit, light.uniforms.outerLimit);
    };

    #setPointLight = (light) => {
        const { pointLight, pointDepthMap } = this.#programs;

        this.#gl.useProgram(pointLight.program);
        this.#setCommonLightUniforms(pointLight.locations, {
            ...light.uniforms,
            depthMap: pointDepthMap.depthMap?.texture.unit,
        });
        this.#gl.uniform1f(pointLight.locations.far, light.uniforms.far);
    };

    #setCommonLightUniforms(locations, uniforms) {
        this.#gl.uniform4f(locations.color, ...uniforms.color);
        this.#gl.uniformMatrix4fv(locations.finalMat, false, uniforms.finalMat);
        this.#gl.uniformMatrix4fv(locations.modelMat, false, uniforms.modelMat);
        this.#gl.uniformMatrix4fv(locations.normalMat, false, uniforms.normalMat);
        this.#gl.uniform3f(locations.lightColor, ...uniforms.lightColor);
        this.#gl.uniform1i(locations.depthMap, uniforms.depthMap);
        this.#gl.uniform3f(locations.ambientColor, ...uniforms.ambientColor);
        this.#gl.uniform3f(locations.lightPosition, ...uniforms.lightPosition);
        this.#gl.uniform3f(locations.cameraPosition, ...uniforms.cameraPosition);
        this.#gl.uniform1f(locations.shininess, uniforms.shininess);
        this.#gl.uniform1f(locations.lightDistanceLin, uniforms.lightDistanceLin);
        this.#gl.uniform1f(locations.lightDistanceQuad, uniforms.lightDistanceQuad);
        this.#gl.uniform1f(locations.cameraDistanceLin, uniforms.cameraDistanceLin);
        this.#gl.uniform1f(locations.cameraDistanceQuad, uniforms.cameraDistanceQuad);
        this.#gl.uniform1i(locations.shadows, this.#shadows ? 1 : 0);
        this.#gl.uniform1i(locations.transparency, this.#transparency ? 1 : 0);
    }

    #initDepthMap(depthMapConf, bindTarget, texTarget) {
        const texture = this.#ctx.createTexture({
            settings: {
                width: depthMapConf.size,
                height: depthMapConf.size,
                internalFormat: this.#gl.DEPTH_COMPONENT32F,
                format: this.#gl.DEPTH_COMPONENT,
                type: this.#gl.FLOAT,
                bindTarget,
                texTarget,
            },
            setParams: () => {
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_COMPARE_MODE, this.#gl.COMPARE_REF_TO_TEXTURE);
            },
        });

        const framebuffer = this.#ctx.createFramebuffer({
            setTexture: () => {
                this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.DEPTH_ATTACHMENT, texTarget, texture.texture, 0);
                this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
            },
        });

        return {
            texture,
            framebuffer,
        };
    }

    #genDepthMap = (light) => {
        if (light instanceof SpotLight) {
            this.#gl.viewport(
                0,
                0,
                this.#programs.spotDepthMap.depthMap.texture.settings.width,
                this.#programs.spotDepthMap.depthMap.texture.settings.height
            );
            this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#programs.spotDepthMap.depthMap.framebuffer);
            this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
            this.#renderModels(light, LightSystemUtils.prepareSpotDepthMapUniforms, this.#setSpotDepthMap, {
                lightMat: light.viewMat,
                phase: "depthMap",
            });
        } else if (light instanceof PointLight) {
            this.#gl.viewport(
                0,
                0,
                this.#programs.pointDepthMap.depthMap.texture.settings.width,
                this.#programs.pointDepthMap.depthMap.texture.settings.height
            );
            this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#programs.pointDepthMap.depthMap.framebuffer);

            for (let side = 0; side < 6; side++) {
                this.#gl.framebufferTexture2D(
                    this.#gl.FRAMEBUFFER,
                    this.#gl.DEPTH_ATTACHMENT,
                    this.#gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                    this.#programs.pointDepthMap.depthMap.texture.texture,
                    0
                );
                this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
                this.#renderModels(light, LightSystemUtils.preparePointDepthMapUniforms, this.#setPointDepthMap, {
                    lightMat: light.viewMats[side],
                    phase: "depthMap",
                });
            }
        }

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
    };

    #setSpotDepthMap = (light) => {
        const { spotDepthMap } = this.#programs;

        this.#gl.useProgram(spotDepthMap.program);
        this.#gl.uniformMatrix4fv(spotDepthMap.locations.finalLightMat, false, light.uniforms.depthMap.finalLightMat);
    };

    #setPointDepthMap = (light) => {
        const { pointDepthMap } = this.#programs;

        this.#gl.useProgram(pointDepthMap.program);
        this.#gl.uniformMatrix4fv(pointDepthMap.locations.finalLightMat, false, light.uniforms.depthMap.finalLightMat);
        this.#gl.uniformMatrix4fv(pointDepthMap.locations.modelMat, false, light.uniforms.depthMap.modelMat);
        this.#gl.uniform3f(pointDepthMap.locations.lightPosition, ...light.uniforms.lightPosition);
        this.#gl.uniform1f(pointDepthMap.locations.far, light.uniforms.depthMap.far);
    };

    setModels(models, replace) {
        if (replace) {
            this.#models = models;
        } else {
            Object.assign(this.#models, models);
            delete this.#models._values;
        }

        this.#models._values = Object.values(this.#models).flatMap((model) => {
            const { uniforms, ...otherModelFields } = model;

            if (Array.isArray(uniforms)) {
                return uniforms.map((uniSet) => ({ ...uniSet, ...otherModelFields }));
            } else {
                return { ...uniforms, ...otherModelFields };
            }
        });
    }

    #renderModels = (light, prepareUniforms, setProgram, renderConf = {}) => {
        const { lightMat, phase } = renderConf;

        for (let i = 0; i < this.#models._values.length; i++) {
            const { culling, render, ...uniforms } = this.#models._values[i];

            switch (phase) {
                case "depthMap":
                    if (culling?.depthMapFront) {
                        this.#gl.enable(this.#gl.CULL_FACE);
                        this.#gl.cullFace(this.#gl.FRONT);
                    } else {
                        this.#gl.disable(this.#gl.CULL_FACE);
                    }
                    break;

                default:
                    if (!this.#transparency && culling?.back) {
                        this.#gl.enable(this.#gl.CULL_FACE);
                        this.#gl.cullFace(this.#gl.BACK);
                    } else {
                        this.#gl.disable(this.#gl.CULL_FACE);
                    }
            }

            prepareUniforms(light, uniforms, lightMat);
            setProgram(light);
            render();
        }
    };
}

export default LightSystem;
