class Light {
    static #SHADERS = {
        spot: {
            vShader: `#version300esuniformmat4u_finalMat;uniformmat4u_modelMat;uniformmat4u_normalMat;uniformmat4u_finalLightMat;invec3a_position;invec3a_normal;invec2a_textureCoords;outvec3v_surfacePos;outvec3v_normal;outvec2v_textureCoords;outvec4v_fragPosInLightSpace;voidmain(){vec4position=vec4(a_position,1);v_surfacePos=vec3(u_modelMat*position);v_normal=mat3(u_normalMat)*a_normal;v_textureCoords=a_textureCoords;v_fragPosInLightSpace=u_finalLightMat*position;gl_Position=u_finalMat*position;}`,
            fShader: `#version300esprecisionhighpfloat;precisionhighpsampler2DShadow;uniformvec3u_color;uniformvec3u_ambientColor;uniformvec3u_lightPosition;uniformvec3u_lightDirection;uniformvec3u_lightColor;uniformvec3u_cameraPosition;uniformfloatu_shininess;uniformfloatu_outerLimit;uniformfloatu_innerLimit;uniformfloatu_distanceConst;uniformfloatu_distanceLin;uniformfloatu_distanceQuad;uniformsampler2DShadowu_depthMap;invec3v_normal;invec3v_surfacePos;invec2v_textureCoords;invec4v_fragPosInLightSpace;outvec4color;constfloatvisibilityBias=0.002;floatgetConeIntensity(vec3surfaceToLight){floatlightSurfaceCos=dot(normalize(u_lightDirection),-surfaceToLight);floatconeIntensity=step(u_outerLimit,lightSurfaceCos);if(coneIntensity==1.){boolinsideConeBorderRange=lightSurfaceCos<=u_innerLimit&&lightSurfaceCos>=u_outerLimit;if(insideConeBorderRange){floatrange=u_innerLimit-u_outerLimit;floatinRangeVal=u_innerLimit-lightSurfaceCos;coneIntensity-=inRangeVal/range;}}returnconeIntensity;}floatgetDistanceFactor(){floatlightToSurface=distance(v_surfacePos,u_lightPosition);floatdistanceFactor=1./(u_distanceConst+u_distanceLin*lightToSurface+u_distanceQuad*pow(lightToSurface,2.));returndistanceFactor;}floatgetVisibility(){vec3projectedCoords=(v_fragPosInLightSpace.xyz/v_fragPosInLightSpace.w+1.)/2.;floatcurrentDepth=projectedCoords.z;floatvisibility=texture(u_depthMap,vec3(projectedCoords.xy,currentDepth-visibilityBias));returnvisibility;}voidmain(){vec3normal=normalize(v_normal);vec3surfaceToLight=normalize(u_lightPosition-v_surfacePos);vec3diffuseColor=vec3(0);vec3specular=vec3(0);floatvisibility=0.;floatdiffuseLight=max(dot(normal,surfaceToLight),0.);if(diffuseLight>0.){floatconeIntensity=getConeIntensity(surfaceToLight);diffuseLight*=coneIntensity;if(diffuseLight>0.){floatdistanceFactor=getDistanceFactor();diffuseLight*=distanceFactor;if(diffuseLight>0.){diffuseColor=diffuseLight*u_lightColor;visibility=getVisibility();if(!isnan(u_shininess)){vec3surfaceToCamera=normalize(u_cameraPosition-v_surfacePos);vec3halfVec=normalize(surfaceToLight+surfaceToCamera);specular=pow(max(dot(normal,halfVec),0.),u_shininess)*u_lightColor*distanceFactor*coneIntensity;}}}}color=vec4(u_color,1);color.rgb*=u_ambientColor+diffuseColor*visibility;color.rgb+=specular*visibility;}`,
            depthMap: {
                vShader: `#version300esuniformmat4u_finalLightMat;invec3a_position;voidmain(){gl_Position=u_finalLightMat*vec4(a_position,1);}`,
                fShader: `#version300esprecisionhighpfloat;voidmain(){gl_FragDepth=gl_FragCoord.z;}`,
            },
        },
        point: {
            vShader: `#version300esuniformmat4u_finalMat;uniformmat4u_modelMat;uniformmat4u_normalMat;invec3a_position;invec3a_normal;invec2a_textureCoords;outvec3v_surfacePos;outvec3v_normal;outvec2v_textureCoords;voidmain(){vec4position=vec4(a_position,1);v_surfacePos=vec3(u_modelMat*position);v_normal=mat3(u_normalMat)*a_normal;v_textureCoords=a_textureCoords;gl_Position=u_finalMat*position;}`,
            fShader: `#version300esprecisionhighpfloat;precisionhighpsamplerCubeShadow;uniformvec3u_color;uniformfloatu_far;uniformvec3u_ambientColor;uniformvec3u_lightPosition;uniformvec3u_lightColor;uniformvec3u_cameraPosition;uniformfloatu_shininess;uniformfloatu_distanceConst;uniformfloatu_distanceLin;uniformfloatu_distanceQuad;uniformsamplerCubeShadowu_depthMap;invec3v_normal;invec3v_surfacePos;invec2v_textureCoords;outvec4color;constfloatvisibilityBias=0.002;floatgetDistanceFactor(){floatlightToSurface=distance(v_surfacePos,u_lightPosition);floatdistanceFactor=1./(u_distanceConst+u_distanceLin*lightToSurface+u_distanceQuad*pow(lightToSurface,2.));returndistanceFactor;}floatgetVisibility(){vec3lightToSurface=v_surfacePos-u_lightPosition;floatcurrentDepth=length(lightToSurface)/u_far;floatvisibility=texture(u_depthMap,vec4(lightToSurface,currentDepth-visibilityBias));returnvisibility;}voidmain(){vec3normal=normalize(v_normal);vec3surfaceToLight=normalize(u_lightPosition-v_surfacePos);vec3diffuseColor=vec3(0);vec3specular=vec3(0);floatvisibility=0.;floatdiffuseLight=max(dot(normal,surfaceToLight),0.);if(diffuseLight>0.){floatdistanceFactor=getDistanceFactor();diffuseLight*=distanceFactor;if(diffuseLight>0.){diffuseColor=diffuseLight*u_lightColor;visibility=getVisibility();if(!isnan(u_shininess)){vec3surfaceToCamera=normalize(u_cameraPosition-v_surfacePos);vec3halfVec=normalize(surfaceToLight+surfaceToCamera);specular=pow(max(dot(normal,halfVec),0.),u_shininess)*u_lightColor*distanceFactor;}}}color=vec4(u_color,1);color.rgb*=u_ambientColor+diffuseColor*visibility;color.rgb+=specular*visibility;}`,
            depthMap: {
                vShader: `#version300esuniformmat4u_finalLightMat;uniformmat4u_modelMat;invec3a_position;outvec3v_surfacePosition;voidmain(){vec4position=vec4(a_position,1);v_surfacePosition=vec3(u_modelMat*position);gl_Position=u_finalLightMat*position;}`,
                fShader: `#version300esprecisionhighpfloat;uniformfloatu_far;uniformvec3u_lightPosition;invec3v_surfacePosition;voidmain(){floatlightToSurfaceDistance=distance(v_surfacePosition,u_lightPosition);gl_FragDepth=lightToSurfaceDistance/u_far;}`,
            },
        },
    };

    constructor(ctx, type, name, depthMapConf, initialUniforms) {
        this.ctx = ctx;
        this.gl = ctx.gl;

        ctx.createPrograms([
            {
                name,
                vShader: Light.#SHADERS[type].vShader,
                fShader: Light.#SHADERS[type].fShader,
            },
            {
                name: `${name}DepthMap`,
                paths: {
                    vShader: Light.#SHADERS[type].depthMap.vShader,
                    fShader: Light.#SHADERS[type].depthMap.fShader,
                },
            },
        ]);

        const program = (this.program = ctx.programs[name]);
        const depthMap = (program.depthMap = ctx.programs[`${name}DepthMap`]);

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

        const texBindTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
        const texTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP_POSITIVE_X : this.gl.TEXTURE_2D;

        depthMap.texture = ctx.createTexture({
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
        depthMap.framebuffer = ctx.createFramebuffer({
            name: "depthMap",
            bindTexture: () => {
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, texTarget, depthMap.texture.texture, 0);
            },
        });

        program.uniforms.depthMap = depthMap.texture.unit;
    }

    ctx;
    gl;
    program;

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

        this.renderModelsToDepthMap(models);

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
