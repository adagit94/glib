import SHADERS from "./shaders.js";
import PointLight from "./lights/PointLight.js";
import SpotLight from "./lights/SpotLight.js";
import SceneUtils from "./SceneUtils.js";
import MatUtils from "../../utils/MatUtils.js";

class Scene {
    static #PERSPECTIVE_CONF = { fov: Math.PI / 4, near: 0.1, far: 100 };

    constructor(ctx, conf, initialUniforms) {
        let { projection, camera, alphaMap } = conf;
        if (!projection) projection = Scene.#PERSPECTIVE_CONF;

        this.#ctx = ctx;
        this.#gl = ctx.gl;

        if (initialUniforms) this.setUniforms(initialUniforms);
        this.#uniforms.camera.position = camera.position;

        this.#projection.mats.proj = MatUtils.perspective(
            projection.fov,
            this.#gl.canvas.width / this.#gl.canvas.height,
            projection.near,
            projection.far
        );
        this.setView(camera);
        
        this.#initAlphaMapProgram(alphaMap);

        this.#gl.enable(this.#gl.BLEND);
        this.#gl.blendEquation(this.#gl.FUNC_ADD);
    }

    #ctx;
    #gl;
    #programs = {
        scene: {},
        alphaMap: {},
    };
    #uniforms = {
        camera: {},
    };
    #projection = {
        mats: {},
    };
    #lights = {};
    #shapes = {};
    #magnets = {};
    #frameDelta;

    setView = conf => {
        this.#projection.mats.view = MatUtils.mult3d(this.#projection.mats.proj, MatUtils.view3d(conf.position, conf.direction));
    };

    setLights(lights) {
        this.#lights = { _values: [] };
        this.#setEntities(this.#lights, lights);
    }

    getLight(name) {
        return this.#lights[name];
    }

    setShapes(shapes) {
        this.#shapes = { _values: [] };
        this.#setEntities(this.#shapes, shapes, { setLayer: true });
    }

    getShape(name) {
        return this.#shapes[name];
    }

    setMagnets(magnets) {
        this.#magnets = { _values: [] };
        this.#setEntities(this.#magnets, magnets);
    }

    getMagnet(name) {
        return this.#magnets[name];
    }

    #setEntities(group, entities, optionals) {
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let entityInstance = entity;

            if (Array.isArray(entity)) {
                const [instanceName, instance] = entity;

                entityInstance = instance;
                group[instanceName] = instance;
            }

            group._values.push(entityInstance);
            if (optionals?.setLayer) entityInstance.layer = i;
        }
    }

    setUniforms(uniforms) {
        Object.assign(this.#uniforms, uniforms);
    }

    getUniforms() {
        return this.#uniforms;
    }

    #prepareSceneProgram() {
        const { scene: sceneProg } = this.#programs;

        const shapesCount = this.#shapes._values.length;
        const highershapesCount = shapesCount > this.#programs.shapesCount;

        let spotLightsCount = 0;
        let activeSpotLights = (sceneProg.activeSpotLights = []);
        let pointLightsCount = 0;
        let activePointLights = (sceneProg.activePointLights = []);

        this.#programs.activeShapes = this.#shapes._values.filter(s => s.active);
        this.#programs.activeMagnets = this.#magnets._values.filter(m => m.active);

        for (const light of this.#lights._values) {
            if (light instanceof SpotLight) {
                spotLightsCount++;
                if (light.active) activeSpotLights.push(light);
            } else if (light instanceof PointLight) {
                pointLightsCount++;
                if (light.active) activePointLights.push(light);
            }
        }

        if (!sceneProg.program || highershapesCount || spotLightsCount > sceneProg.spotLightsCount || pointLightsCount > sceneProg.pointLightsCount) {
            if (sceneProg.program) {
                this.#gl.deleteProgram(sceneProg.program);
            }

            let newSceneProg = Object.assign(
                this.#programs.scene,
                this.#ctx.createProgram({
                    vShader: SHADERS.scene.vShader(spotLightsCount, pointLightsCount),
                    fShader: SHADERS.scene.fShader(shapesCount, spotLightsCount, pointLightsCount),
                })
            );

            Object.assign(newSceneProg.locations, {
                modelMat: this.#gl.getUniformLocation(newSceneProg.program, "u_modelMat"),
                normalMat: this.#gl.getUniformLocation(newSceneProg.program, "u_normalMat"),
                spotLightAlphaMap: this.#gl.getUniformLocation(newSceneProg.program, "u_spotLightAlphaMap"),
                pointLightAlphaMap: this.#gl.getUniformLocation(newSceneProg.program, "u_pointLightAlphaMap"),
                spotLightsCount: this.#gl.getUniformLocation(newSceneProg.program, "u_spotLightsCount"),
                pointLightsCount: this.#gl.getUniformLocation(newSceneProg.program, "u_pointLightsCount"),
                ambientLight: this.#gl.getUniformLocation(newSceneProg.program, "u_ambientLight"),
            });

            newSceneProg.spotLightsCount = spotLightsCount;
            newSceneProg.pointLightsCount = pointLightsCount;

            const { textures } = this.#programs.alphaMap.alphaMap;

            this.#programs.alphaMap.alphaMap.setTex(textures.spotLight, shapesCount * spotLightsCount);
            this.#programs.alphaMap.alphaMap.setTex(textures.pointLight, shapesCount * pointLightsCount * 6);
        }

        this.#programs.shapesCount = shapesCount;
    }

    #initAlphaMapProgram(conf) {
        let alphaMap = Object.assign(
            this.#programs.alphaMap,
            this.#ctx.createProgram({
                vShader: SHADERS.alphaMap.vShader,
                fShader: SHADERS.alphaMap.fShader,
            })
        );
        Object.assign(alphaMap.locations, {
            finalLightMat: this.#gl.getUniformLocation(alphaMap.program, "u_finalLightMat"),
        });
        alphaMap.alphaMap = this.#initAlphaMap(conf);
    }

    #initAlphaMap(conf) {
        const bindAndTexTarget = this.#gl.TEXTURE_2D_ARRAY;
        const texSettings = {
            width: conf.width,
            height: conf.height,
            depth: 0,
            internalFormat: this.#gl.RGBA,
            format: this.#gl.RGBA,
            type: this.#gl.UNSIGNED_BYTE,
            bindTarget: bindAndTexTarget,
            texTarget: bindAndTexTarget,
        };

        const spotLightTexture = this.#createTexForLight({ unit: 0, ...texSettings });
        const pointLightTexture = this.#createTexForLight({ unit: 1, ...texSettings });

        const framebuffer = this.#ctx.createFramebuffer({
            setTexture: () => {
                this.#setLightTexLayer(spotLightTexture.texture, 0);
                this.#setLightTexLayer(pointLightTexture.texture, 0);
            },
        });

        return {
            textures: {
                spotLight: spotLightTexture,
                pointLight: pointLightTexture,
            },
            framebuffer,
            setTex: (tex, layers) => {
                this.#gl.activeTexture(this.#gl[`TEXTURE${tex.settings.unit}`]);
                this.#gl.texImage3D(
                    texSettings.texTarget,
                    0,
                    texSettings.internalFormat,
                    texSettings.width,
                    texSettings.height,
                    layers,
                    0,
                    texSettings.format,
                    texSettings.type,
                    null
                );
            },
        };
    }

    #createTexForLight(settings) {
        return this.#ctx.createTexture({
            settings,
            setParams: () => {
                this.#gl.texParameteri(settings.bindTarget, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
                this.#gl.texParameteri(settings.bindTarget, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
                this.#gl.texParameteri(settings.bindTarget, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
                this.#gl.texParameteri(settings.bindTarget, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
            },
        });
    }

    #setLightTexLayer(tex, layer) {
        this.#gl.framebufferTextureLayer(this.#gl.FRAMEBUFFER, this.#gl.COLOR_ATTACHMENT0, tex, 0, layer);
    }

    #sortAndSetShapesFromLight(light) {
        light.shapesFromLight = SceneUtils.sortByDistance({
            entities: this.#programs.activeShapes,
            refPoint: light.getUniforms().position,
            direction: "from",
        }).map(s => s.layer);
    }

    #genSpotLightAlphaMap = (light, index) => {
        this.#gl.useProgram(this.#programs.alphaMap.program);

        this.#renderShapes(light, this.#setSpotLightAlphaMap, {
            phase: "alphaMap",
            lightIndex: index,
            lightMat: light.projection.mats.view,
        });
    };

    #setSpotLightAlphaMap = (lightConf, shape) => {
        this.#setAlphaMap(lightConf, shape, {
            tex: this.#programs.alphaMap.alphaMap.textures.spotLight.texture,
            layer: this.#programs.activeShapes.length * lightConf.lightIndex + shape.layer,
        });
    };

    #genPointLightAlphaMap = (light, index) => {
        this.#gl.useProgram(this.#programs.alphaMap.program);

        for (let cubeSide = 0; cubeSide < 6; cubeSide++) {
            this.#renderShapes(light, this.#setPointLightAlphaMap, {
                phase: "alphaMap",
                lightMat: light.projection.mats.view[cubeSide],
                lightIndex: index,
                cubeSide,
            });
        }
    };

    #setPointLightAlphaMap = (lightConf, shape) => {
        const { activeShapes } = this.#programs;

        this.#setAlphaMap(lightConf, shape, {
            tex: this.#programs.alphaMap.alphaMap.textures.pointLight.texture,
            layer: shape.layer + activeShapes.length * lightConf.lightIndex * 6 + activeShapes.length * lightConf.cubeSide,
        });
    };

    #setAlphaMap = (lightConf, shape, texConf) => {
        const { alphaMap: alphaMapProg } = this.#programs;
        const shapeUniforms = shape.getUniforms();

        if (shapeUniforms.color) this.#gl.uniform4f(alphaMapProg.locations.color, ...shapeUniforms.color);
        this.#gl.uniform1i(alphaMapProg.locations.useBufferColor, shapeUniforms.useBufferColor ? 1 : 0);
        this.#gl.uniformMatrix4fv(alphaMapProg.locations.finalLightMat, false, MatUtils.mult3d(lightConf.lightMat, shapeUniforms.modelMat));

        this.#setLightTexLayer(texConf.tex, texConf.layer);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
    };

    #genScene = () => {
        this.#gl.useProgram(this.#programs.scene.program);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        SceneUtils.sortByDistance({ entities: this.#programs.activeShapes, refPoint: this.#uniforms.camera.position, direction: "to" });

        this.#renderShapes(undefined, this.#setScene, { phase: "final" });
    };

    #setScene = (_lightConf, shape) => {
        const { scene, alphaMap } = this.#programs;
        const { textures } = alphaMap.alphaMap;
        const shapeUniforms = shape.getUniforms();

        if (shape.sortTriangles) shape.sortIndices(this.#uniforms.camera.position);

        this.#setShapeLocations(shapeUniforms);
        this.#setSpotLightsLocationsForShape(shapeUniforms, shape.layer);
        this.#setPointLightsLocationsForShape(shapeUniforms, shape.layer);
        this.#gl.uniform1i(scene.locations.spotLightAlphaMap, textures.spotLight.settings.unit);
        this.#gl.uniform1i(scene.locations.pointLightAlphaMap, textures.pointLight.settings.unit);
    };

    #setSpotLightsLocationsForShape(uniforms, layer) {
        const { scene, activeShapes } = this.#programs;
        const { activeSpotLights } = scene;

        for (let light = 0, shapesOffset = 0; light < activeSpotLights.length; light++, shapesOffset += activeShapes.length) {
            const lightInstance = activeSpotLights[light];
            const alphaMapLayers = this.#getAlphaMapLayersForLight(lightInstance, layer);

            alphaMapLayers.forEach((l, i) => {
                this.#gl.uniform1i(this.#gl.getUniformLocation(scene.program, `u_spotLights[${light}].alphaMapLayers[${i}]`), l + shapesOffset);
            });

            this.#gl.uniformMatrix4fv(
                this.#gl.getUniformLocation(scene.program, `u_finalSpotLightsMats[${light}]`),
                false,
                MatUtils.mult3d(lightInstance.projection.mats.view, uniforms.modelMat)
            );
            this.#gl.uniform1i(this.#gl.getUniformLocation(scene.program, `u_spotLights[${light}].alphaMapLayersCount`), alphaMapLayers.length);
        }
    }

    #setPointLightsLocationsForShape(uniforms, layer) {
        const { scene, activeShapes } = this.#programs;
        const { activePointLights } = scene;

        for (let light = 0, sidesOffset = 0, shapesOffset = 0; light < activePointLights.length; light++) {
            const lightInstance = activePointLights[light];
            const alphaMapLayersForLight = this.#getAlphaMapLayersForLight(lightInstance, layer);

            for (let cubeSide = 0, layerIndex = 0; cubeSide < 6; cubeSide++, sidesOffset++, shapesOffset += activeShapes.length) {
                for (const layer of alphaMapLayersForLight) {
                    this.#gl.uniform1i(
                        this.#gl.getUniformLocation(scene.program, `u_pointLights[${light}].alphaMapLayers[${layerIndex++}]`),
                        layer + shapesOffset
                    );
                }

                this.#gl.uniformMatrix4fv(
                    this.#gl.getUniformLocation(scene.program, `u_finalPointLightsMats[${sidesOffset}]`),
                    false,
                    MatUtils.mult3d(lightInstance.projection.mats.view[cubeSide], uniforms.modelMat)
                );
            }

            this.#gl.uniform1i(
                this.#gl.getUniformLocation(scene.program, `u_pointLights[${light}].alphaMapLayersCount`),
                alphaMapLayersForLight.length
            );
        }
    }

    #getAlphaMapLayersForLight(light, layer) {
        const currentShapelI = light.shapesFromLight.findIndex(l => l === layer);
        const layersFromLightToShape = light.shapesFromLight.slice(0, currentShapelI);

        return layersFromLightToShape;
    }

    #setSceneLocations() {
        const { scene } = this.#programs;

        this.#gl.useProgram(scene.program);

        this.#gl.uniform1i(scene.locations.spotLightsCount, scene.activeSpotLights.length);
        this.#gl.uniform1i(scene.locations.pointLightsCount, scene.activePointLights.length);
        this.#gl.uniform3f(scene.locations.ambientLight, ...this.#uniforms.ambientLight);
        this.#gl.uniform3f(this.#gl.getUniformLocation(scene.program, `u_camera.position`), ...this.#uniforms.camera.position);
        this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_camera.distanceLin`), this.#uniforms.camera.distanceLin);
        this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_camera.distanceQuad`), this.#uniforms.camera.distanceQuad);
    }

    #setLightLocations = (light, index) => {
        const { scene } = this.#programs;
        const uniforms = light.getUniforms();

        this.#gl.useProgram(scene.program);

        this.#gl.uniform3f(this.#gl.getUniformLocation(scene.program, `u_${light.type}Lights[${index}].color`), ...uniforms.color);
        this.#gl.uniform3f(this.#gl.getUniformLocation(scene.program, `u_${light.type}Lights[${index}].position`), ...uniforms.position);
        this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_${light.type}Lights[${index}].shininess`), uniforms.shininess);
        this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_${light.type}Lights[${index}].distanceLin`), uniforms.distanceLin);
        this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_${light.type}Lights[${index}].distanceQuad`), uniforms.distanceQuad);

        if (light.type === "spot") {
            this.#gl.uniform3f(this.#gl.getUniformLocation(scene.program, `u_spotLights[${index}].direction`), ...uniforms.direction);
            this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_spotLights[${index}].outerLimit`), uniforms.outerLimit);
            this.#gl.uniform1f(this.#gl.getUniformLocation(scene.program, `u_spotLights[${index}].innerLimit`), uniforms.innerLimit);
        }
    };

    #setShapeLocations(uniforms) {
        const { locations } = this.#programs.scene;

        if (uniforms.color) this.#gl.uniform4f(locations.color, ...uniforms.color);
        this.#gl.uniform1i(locations.useBufferColor, uniforms.useBufferColor ? 1 : 0);
        this.#gl.uniformMatrix4fv(locations.finalMat, false, MatUtils.mult3d(this.#projection.mats.view, uniforms.modelMat));
        this.#gl.uniformMatrix4fv(locations.modelMat, false, uniforms.modelMat);
        this.#gl.uniformMatrix4fv(locations.normalMat, false, MatUtils.normal3d(uniforms.modelMat));
    }

    #evalEffectsForShapes() {
        const { activeShapes, activeMagnets } = this.#programs;

        for (let i = 0; i < activeShapes.length; i++) {
            const shape = activeShapes[i]

            const magnetism = shape.getEffect("magnetism")
            
            if (magnetism.active) magnetism.evalMagnets(this.#frameDelta, activeMagnets);
        }
    }

    render(frameDelta) {
        const { alphaMap } = this.#programs;

        this.#frameDelta = frameDelta;

        this.#prepareSceneProgram();
        this.#setSceneLocations();
        this.#evalEffectsForShapes()

        this.#gl.blendFuncSeparate(this.#gl.ZERO, this.#gl.ZERO, this.#gl.ONE_MINUS_DST_ALPHA, this.#gl.ONE);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, alphaMap.alphaMap.framebuffer);

        for (const lightType of this.#getLightTypesConfs()) {
            const { texSettings, activeLights, genAlphaMap } = lightType;

            this.#gl.viewport(0, 0, texSettings.width, texSettings.height);

            for (let i = 0; i < activeLights.length; i++) {
                const light = activeLights[i];

                this.#sortAndSetShapesFromLight(light);
                this.#setLightLocations(light, i);
                genAlphaMap(light, i);
            }
        }

        this.#gl.blendFuncSeparate(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA, this.#gl.ONE, this.#gl.ZERO);
        this.#genScene();
    }

    #renderShapes = (light, setProgram, renderConf = {}) => {
        const { _phase, lightIndex, lightMat, cubeSide } = renderConf;
        const lightConf = { uniforms: light?.getUniforms(), lightIndex, lightMat, cubeSide };
        const { activeShapes } = this.#programs;

        for (let i = 0; i < activeShapes.length; i++) {
            const shape = activeShapes[i];

            setProgram(lightConf, shape);
            shape.render();
        }
    };

    #getLightTypesConfs = () => [
        {
            texSettings: this.#programs.alphaMap.alphaMap.textures.spotLight.settings,
            activeLights: this.#programs.scene.activeSpotLights,
            genAlphaMap: this.#genSpotLightAlphaMap,
        },
        {
            texSettings: this.#programs.alphaMap.alphaMap.textures.pointLight.settings,
            activeLights: this.#programs.scene.activePointLights,
            genAlphaMap: this.#genPointLightAlphaMap,
        },
    ];
}

export default Scene;
