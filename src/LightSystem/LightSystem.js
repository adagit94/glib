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
                name: "spotAlphaMap",
                vShader: SHADERS.spot.alphaMap.vShader,
                fShader: SHADERS.spot.alphaMap.fShader,
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
            {
                name: "pointAlphaMap",
                vShader: SHADERS.point.alphaMap.vShader,
                fShader: SHADERS.point.alphaMap.fShader,
            },
        ]);

        const { spotLight, spotDepthMap, spotAlphaMap, pointLight, pointDepthMap, pointAlphaMap } = this.#programs;

        Object.assign(spotLight.locations, this.#getCommonLightLocations(spotLight.program), {
            finalLightMat: this.#gl.getUniformLocation(spotLight.program, "u_finalLightMat"),
            lightDirection: this.#gl.getUniformLocation(spotLight.program, "u_lightDirection"),
            innerLimit: this.#gl.getUniformLocation(spotLight.program, "u_innerLimit"),
            outerLimit: this.#gl.getUniformLocation(spotLight.program, "u_outerLimit"),
        });
        Object.assign(spotDepthMap.locations, { finalLightMat: this.#gl.getUniformLocation(spotDepthMap.program, "u_finalLightMat") });
        Object.assign(spotAlphaMap.locations, this.#getCommonAlphaMapLocations(spotAlphaMap.program));

        Object.assign(pointLight.locations, this.#getCommonLightLocations(pointLight.program), {
            far: this.#gl.getUniformLocation(pointLight.program, "u_far"),
        });
        Object.assign(pointDepthMap.locations, {
            finalLightMat: this.#gl.getUniformLocation(pointDepthMap.program, "u_finalLightMat"),
            modelMat: this.#gl.getUniformLocation(pointDepthMap.program, "u_modelMat"),
            lightPosition: this.#gl.getUniformLocation(pointDepthMap.program, "u_lightPosition"),
            far: this.#gl.getUniformLocation(pointDepthMap.program, "u_far"),
        });
        Object.assign(pointAlphaMap.locations, this.#getCommonAlphaMapLocations(pointAlphaMap.program));

        if (this.#transparency) {
            ctx.gl.enable(ctx.gl.BLEND);
            // ctx.gl.blendFuncSeparate(ctx.gl.SRC_ALPHA, ctx.gl.ONE_MINUS_SRC_ALPHA, ctx.gl.ONE, ctx.gl.ZERO);
            ctx.gl.blendFuncSeparate(ctx.gl.SRC_ALPHA, ctx.gl.ONE, ctx.gl.ONE, ctx.gl.ZERO);
            ctx.gl.blendEquation(ctx.gl.FUNC_ADD);

            this.#programs.spotAlphaMap.createAlphaMap = () => this.#initAlphaMap(conf.alphaMap, ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_2D);
            this.#programs.spotAlphaMap.alphaMaps = [];
            this.#programs.pointAlphaMap.createAlphaMap = () =>
                this.#initAlphaMap(conf.alphaMap, ctx.gl.TEXTURE_CUBE_MAP, ctx.gl.TEXTURE_CUBE_MAP_POSITIVE_X);
            this.#programs.pointAlphaMap.alphaMaps = [];
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
            alphaMap: this.#gl.getUniformLocation(program, "u_alphaMap"),
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

    #getCommonAlphaMapLocations(program) {
        return {
            finalLightMat: this.#gl.getUniformLocation(program, "u_finalLightMat"),
            modelMat: this.#gl.getUniformLocation(program, "u_modelMat"),
            lightPosition: this.#gl.getUniformLocation(program, "u_lightPosition"),
            alphaMaps: this.#gl.getUniformLocation(program, "u_alphaMaps"),
        };
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
                this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.DEPTH_ATTACHMENT, texTarget, this.depthMap.texture.texture, 0);
                this.#gl.clear(this.#gl.DEPTH_BUFFER_BIT);
            },
        });

        return {
            texture,
            framebuffer,
        };
    }

    #initAlphaMap(alphaMapConf, bindTarget, texTarget) {
        const texture = this.#ctx.createTexture({
            settings: {
                width: alphaMapConf.size,
                height: alphaMapConf.size,
                internalFormat: this.#gl.ALPHA,
                format: this.#gl.ALPHA,
                type: this.#gl.UNSIGNED_BYTE,
                bindTarget,
                texTarget,
            },
            setParams: () => {
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_MAG_FILTER, this.#gl.NEAREST);
                this.#gl.texParameteri(bindTarget, this.#gl.TEXTURE_MIN_FILTER, this.#gl.NEAREST);
                // this.#gl.texParameteri(texBindTarget, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
                // this.#gl.texParameteri(texBindTarget, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
                // this.#gl.texParameteri(texBindTarget, this.#gl.TEXTURE_COMPARE_MODE, this.#gl.COMPARE_REF_TO_TEXTURE);
            },
        });

        const framebuffer = this.#ctx.createFramebuffer({
            setTexture: () => {
                this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.ALPHA, texTarget, texture, 0);
            },
        });

        return {
            texture,
            framebuffer,
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

    renderLights() {
        const lights = this.#lights._values;

        for (const light of lights) {
            if (light.active) {
                if (this.#transparency) {
                    LightSystemUtils.sortModels({ models: this.#models._values, origin: light.uniforms.lightPosition });
                    this.#genAlphaMaps(light);
                } else if (this.#shadows) {
                    this.#genDepthMap(light);
                }

                this.#genLight(light);
            }
        }
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
            this.#renderModels(light, "spot", LightSystemUtils.prepareSpotDepthMapUniforms, this.#setSpotDepthMap, {
                lightMat: light.viewMat,
                phase: "depthMap",
            });

            // this.#gl.activeTexture(this.#gl[`TEXTURE${this.#programs.spotDepthMap.depthMap.texture.unit}`]);
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
                this.#renderModels(light, "point", LightSystemUtils.preparePointDepthMapUniforms, this.#setPointDepthMap, {
                    lightMat: light.viewMats[side],
                    phase: "depthMap",
                });
            }

            // this.#gl.activeTexture(this.#gl[`TEXTURE${this.#programs.pointDepthMap.depthMap.texture.unit}`]);
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

    #genAlphaMaps = (light) => {
        if (light instanceof SpotLight) {
            this.#renderModels(light, "spot", LightSystemUtils.prepareAlphaMapUniforms, this.#setSpotAlphaMap, {
                lightMat: light.viewMat,
                phase: "alphaMap",
            });
        } else if (light instanceof PointLight) {
            for (let side = 0; side < 6; side++) {
                this.#renderModels(light, "point", LightSystemUtils.prepareAlphaMapUniforms, this.#setPointAlphaMap, {
                    lightMat: light.viewMats[side],
                    phase: "alphaMap",
                    cubeMapSide: side,
                });
            }
        }

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
    };

    #setAlphaMap = (light, alphaMap, cubeMapSide) => {
        this.#gl.viewport(0, 0, alphaMap.texture.settings.width, alphaMap.texture.settings.height);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, alphaMap.framebuffer);

        if (light instanceof PointLight) {
            this.#gl.framebufferTexture2D(
                this.#gl.FRAMEBUFFER,
                this.#gl.ALPHA,
                this.#gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeMapSide,
                alphaMap.texture.texture,
                0
            );
        }

        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
    };

    #setSpotAlphaMap = (light, modelTexUnits) => {
        const { spotAlphaMap } = this.#programs;

        this.#gl.useProgram(spotAlphaMap.program);
        this.#setAlphaMapUniforms(spotAlphaMap.locations, light, modelTexUnits);
    };

    #setPointAlphaMap = (light, modelTexUnits) => {
        const { pointAlphaMap } = this.#programs;

        this.#gl.useProgram(pointAlphaMap.program);
        this.#setAlphaMapUniforms(pointAlphaMap.locations, light, modelTexUnits);
    };

    #setAlphaMapUniforms = (locations, light, modelTexUnits) => {
        this.#gl.uniformMatrix4fv(locations.finalLightMat, false, light.uniforms.alphaMap.finalLightMat);
        this.#gl.uniformMatrix4fv(locations.modelMat, false, light.uniforms.alphaMap.modelMat);
        this.#gl.uniform3f(locations.lightPosition, ...light.uniforms.lightPosition);
        this.#gl.uniform1i(locations.alphaMaps, modelTexUnits.alphaMaps);
    };

    #genLight = (light) => {
        let setLight;
        let prepareUniforms;
        let lightType;

        if (light instanceof SpotLight) {
            setLight = this.#setSpotLight;
            prepareUniforms = LightSystemUtils.prepareSpotUniforms;
            lightType = "spot";
        } else if (light instanceof PointLight) {
            setLight = this.#setPointLight;
            prepareUniforms = LightSystemUtils.preparePointUniforms;
            lightType = "point";
        }

        this.#renderModels(light, lightType, prepareUniforms, setLight);
    };

    #setSpotLight = (light, modelTexUnits) => {
        const { spotLight } = this.#programs;

        this.#gl.useProgram(spotLight.program);
        this.#setCommonLightUniforms(spotLight.locations, light, {
            depthMap: this.#programs.spotDepthMap.texture.unit,
            ...modelTexUnits,
        });
        this.#gl.uniformMatrix4fv(spotLight.locations.finalLightMat, false, light.uniforms.finalLightMat);
        this.#gl.uniform3f(spotLight.locations.lightDirection, ...light.uniforms.lightDirection);
        this.#gl.uniform1f(spotLight.locations.innerLimit, light.uniforms.innerLimit);
        this.#gl.uniform1f(spotLight.locations.outerLimit, light.uniforms.outerLimit);
    };

    #setPointLight = (light, modelTexUnits) => {
        const { pointLight } = this.#programs;

        this.#gl.useProgram(pointLight.program);
        this.#setCommonLightUniforms(pointLight.locations, light, {
            depthMap: this.#programs.pointDepthMap.texture.unit,
            ...modelTexUnits,
        });
        this.#gl.uniform1f(pointLight.locations.far, light.uniforms.far);
    };

    #setCommonLightUniforms(locations, light, texUnits) {
        this.#gl.uniform4f(locations.color, ...light.uniforms.color);
        this.#gl.uniformMatrix4fv(locations.finalMat, false, light.uniforms.finalMat);
        this.#gl.uniformMatrix4fv(locations.modelMat, false, light.uniforms.modelMat);
        this.#gl.uniformMatrix4fv(locations.normalMat, false, light.uniforms.normalMat);
        this.#gl.uniform3f(locations.lightColor, ...light.uniforms.lightColor);
        this.#gl.uniform1i(locations.depthMap, texUnits.depthMap);
        this.#gl.uniform1i(locations.alphaMap, texUnits.alphaMap);
        this.#gl.uniform3f(locations.ambientColor, ...light.uniforms.ambientColor);
        this.#gl.uniform3f(locations.lightPosition, ...light.uniforms.lightPosition);
        this.#gl.uniform3f(locations.cameraPosition, ...light.uniforms.cameraPosition);
        this.#gl.uniform1f(locations.shininess, light.uniforms.shininess);
        this.#gl.uniform1f(locations.lightDistanceLin, light.uniforms.lightDistanceLin);
        this.#gl.uniform1f(locations.lightDistanceQuad, light.uniforms.lightDistanceQuad);
        this.#gl.uniform1f(locations.cameraDistanceLin, light.uniforms.cameraDistanceLin);
        this.#gl.uniform1f(locations.cameraDistanceQuad, light.uniforms.cameraDistanceQuad);
        this.#gl.uniform1i(locations.shadows, this.#depthMap ? 1 : 0);
        this.#gl.uniform1i(locations.transparency, this.#alphaMap ? 1 : 0);
    }

    #renderModels = (light, lightType, prepareUniforms, setProgram, renderConf = {}) => {
        const { lightMat, phase, cubeMapSide } = renderConf;

        const alphaMapProg = this.#programs[`${lightType}AlphaMap`];
        let modelsAlphaMaps = alphaMapProg.alphaMaps;

        for (let i = 0; i < this.#models._values.length; i++) {
            const { culling, render, ...uniforms } = this.#models._values[i];

            let modelAlphaMap = modelsAlphaMaps[i];
            let texUnits;

            switch (phase) {
                case "depthMap":
                    if (culling?.depthMapFront) {
                        this.#gl.enable(this.#gl.CULL_FACE);
                        this.#gl.cullFace(this.#gl.FRONT);
                    } else {
                        this.#gl.disable(this.#gl.CULL_FACE);
                    }
                    break;

                case "alphaMap": {
                    if (modelAlphaMap === undefined) {
                        modelAlphaMap = modelsAlphaMaps[i] = alphaMapProg.createAlphaMap();
                    }
                    this.#setAlphaMap(light, modelAlphaMap, cubeMapSide);
                    texUnits = { alphaMaps: modelsAlphaMaps.slice(0, i).map((alphaMap) => alphaMap.texture.unit) };
                    break;
                }

                default:
                    texUnits = { alphaMap: modelAlphaMap.texture.unit };
                    if (!this.#transparency && culling?.back) {
                        this.#gl.enable(this.#gl.CULL_FACE);
                        this.#gl.cullFace(this.#gl.BACK);
                    } else {
                        this.#gl.disable(this.#gl.CULL_FACE);
                    }
            }

            prepareUniforms(light, uniforms, lightMat);
            setProgram(light, texUnits);
            render();
        }
    };
}

export default LightSystem;
