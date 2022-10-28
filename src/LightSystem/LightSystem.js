import SHADERS from "../shaders.js";
import PointLight from "./lights/PointLight/PointLight.js";
import SpotLight from "./lights/SpotLight/SpotLight.js";

class LightSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.gl = ctx.gl;

        ctx.gl.enable(ctx.gl.BLEND);
        ctx.gl.blendFunc(ctx.gl.ONE, ctx.gl.ONE);
        ctx.gl.blendEquation(ctx.gl.FUNC_ADD);

        this.programs = ctx.createPrograms(
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

        const { spotLight, spotDepthMap, pointLight, pointDepthMap } = this.programs;

        Object.assign(spotLight.locations, this.#getCommonLightLocations(spotLight.program), {
            finalLightMat: this.gl.getUniformLocation(spotLight.program, "u_finalLightMat"),
            lightDirection: this.gl.getUniformLocation(spotLight.program, "u_lightDirection"),
            innerLimit: this.gl.getUniformLocation(spotLight.program, "u_innerLimit"),
            outerLimit: this.gl.getUniformLocation(spotLight.program, "u_outerLimit"),
        });
        Object.assign(spotDepthMap.locations, this.#getCommonDepthMapLocations(spotDepthMap.program));

        Object.assign(pointLight.locations, this.#getCommonLightLocations(pointLight.program), {
            far: this.gl.getUniformLocation(pointLight.program, "u_far"),
        });
        Object.assign(pointDepthMap.locations, this.#getCommonDepthMapLocations(pointDepthMap.program), {
            modelMat: this.gl.getUniformLocation(pointDepthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(pointDepthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(pointDepthMap.program, "u_far"),
        });
    }

    ctx;
    gl;
    programs;
    lights = {};

    #getCommonLightLocations(program) {
        return {
            modelMat: this.gl.getUniformLocation(program, "u_modelMat"),
            normalMat: this.gl.getUniformLocation(program, "u_normalMat"),
            lightColor: this.gl.getUniformLocation(program, "u_lightColor"),
            depthMap: this.gl.getUniformLocation(program, "u_depthMap"),
            ambientColor: this.gl.getUniformLocation(program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(program, "u_shininess"),
            distanceConst: this.gl.getUniformLocation(program, "u_distanceConst"),
            distanceLin: this.gl.getUniformLocation(program, "u_distanceLin"),
            distanceQuad: this.gl.getUniformLocation(program, "u_distanceQuad"),
        };
    }

    #getCommonDepthMapLocations(program) {
        return {
            finalLightMat: this.gl.getUniformLocation(program, "u_finalLightMat"),
        };
    }

    addLight(type, name, depthMapConf, initialUniforms) {
        let light;

        switch (type) {
            case "spot":
                light = new SpotLight(this.ctx, depthMapConf, initialUniforms);
                break;

            case "point":
                light = new PointLight(this.ctx, depthMapConf, initialUniforms);
                break;
        }

        this.lights[name] = light;
    }

    

    #setLight(uniforms) {
        this.gl.useProgram(this.program);

        Object.entries(uniforms).forEach(([k, v]) => {
            this.uniforms[k] = v;
        });

        this.#setCommonUniforms();
    }

    #genDepthMap = (models) => {
        this.gl.viewport(0, 0, this.depthMap.texture.settings.width, this.depthMap.texture.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthMap.framebuffer);

        this.renderModelsToDepthMap(models);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.activeTexture(this.gl[`TEXTURE${this.depthMap.texture.unit}`]);
    };

    #prepareSpotLight = (viewSettings) => {
        const { depthMap, uniforms } = this;
        const { position, direction } = viewSettings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
    };

    #renderModelsToSpotDepthMap = (models) => {
        const { depthMap } = this;

        for (const model of models) {
            const mats = Array.isArray(model.mats) ? model.mats : [model.mats];

            for (const mat of mats) {
                depthMap.uniforms.finalLightMat = MatUtils.multMats3d(depthMap.light.viewMat, mat);

                this.setDepthMap();
                model.render();
            }
        }
    };

    #preparePointLight = (position) => {
        const { depthMap, uniforms } = this;

        uniforms.lightPosition = depthMap.uniforms.lightPosition = position;
        depthMap.light.viewMats = [];

        // x+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
        );

        // x-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
        );

        // y+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
        );

        // y-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
        );

        // z+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
        );

        // z-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
        );
    };

    #renderModelsToPointDepthMap = (models) => {
        const { depthMap } = this;

        for (let side = 0; side < 6; side++) {
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                depthMap.texture.texture,
                0
            );

            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            const lightMat = depthMap.light.viewMats[side];

            for (const model of models) {
                const mats = Array.isArray(model.mats) ? model.mats : [model.mats];

                for (const mat of mats) {
                    depthMap.uniforms.finalLightMat = MatUtils.multMats3d(lightMat, mat);
                    depthMap.uniforms.modelMat = mat;

                    this.setDepthMap();
                    model.render();
                }
            }
        }
    };

    #setCommonUniforms() {
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

    #setCommonDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.depthMap.locations.finalLightMat, false, this.depthMap.uniforms.finalLightMat);
    }

    #getCommonMatUniforms(secondToModelMat, modelMat) {
        return {
            modelMat: modelMat,
            normalMat: MatUtils.normal3d(modelMat),
            finalMat: MatUtils.multMats3d(secondToModelMat, modelMat),
        };
    }

    #setSpotDepthMap() {
        this.gl.useProgram(this.depthMap.program);
        this.#setCommonDepthMapUniforms();
    }

    
    #setSpotUniforms() {
        this.#setCommonUniforms();

        this.gl.uniformMatrix4fv(this.locations.finalLightMat, false, this.uniforms.finalLightMat);
        this.gl.uniform3f(this.locations.lightDirection, ...this.uniforms.lightDirection);
        this.gl.uniform1f(this.locations.innerLimit, this.uniforms.innerLimit);
        this.gl.uniform1f(this.locations.outerLimit, this.uniforms.outerLimit);
    }

    #getSpotMatUniforms(secondToModelMat, modelMat) {
        return {
            ...this.#getCommonMatUniforms(secondToModelMat, modelMat),
            finalLightMat: MatUtils.multMats3d(this.depthMap.light.viewMat, modelMat),
        };
    }

    #getPointMatUniforms(secondToModelMat, modelMat) {
        return this.#getCommonMatUniforms(secondToModelMat, modelMat);
    }

    #setPointUniforms() {
        this.#setCommonUniforms();

        this.gl.uniform1f(this.locations.far, this.uniforms.far);
    }

    #setPointDepthMap() {
        this.gl.useProgram(this.depthMap.program);
        this.#setPointDepthMapUniforms();
    }

    #setPointDepthMapUniforms() {
        this.#setCommonDepthMapUniforms();

        this.gl.uniformMatrix4fv(this.depthMap.locations.modelMat, false, this.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.depthMap.locations.lightPosition, ...this.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.depthMap.locations.far, this.depthMap.uniforms.far);
    }
}

export default LightSystem;
