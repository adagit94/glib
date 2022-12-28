export default {
    scene: {
        vShader: (maxSpotLightsCount, maxPointLightsCount) => `#version 300 es

        precision highp int;
        
        uniform mat4 u_finalMat;
        uniform mat4 u_modelMat;
        uniform mat4 u_normalMat;
        uniform mat4 u_finalSpotLightsMats[${maxSpotLightsCount + 1}];
        uniform int u_spotLightsCount;
        uniform mat4 u_finalPointLightsMats[${maxPointLightsCount * 6 + 1}];
        uniform int u_pointLightsCount;
        
        in vec3 a_position;
        in vec3 a_normal;
        in vec2 a_textureCoords;
        
        out vec3 v_surfacePos;
        out vec3 v_normal;
        out vec2 v_textureCoords;
        out vec4 v_fragPosInSpotLightsSpaces[${maxSpotLightsCount + 1}];
        out vec4 v_fragPosInPointLightsSpaces[${maxPointLightsCount * 6 + 1}];
        
        void main() {
            vec4 position = vec4(a_position, 1);

            for(int i = 0; i < u_spotLightsCount; i++) {
                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let light = 0; light < maxSpotLightsCount; light++) {
                            switchBody += `case ${light}:
                                            v_fragPosInSpotLightsSpaces[${light}] = u_finalSpotLightsMats[${light}] * position;
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }
            }

            for(int i = 0; i < u_pointLightsCount * 6; i++) {
                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let cubeSide = 0; cubeSide < maxPointLightsCount * 6; cubeSide++) {
                            switchBody += `case ${cubeSide}:
                                            v_fragPosInPointLightsSpaces[${cubeSide}] = u_finalPointLightsMats[${cubeSide}] * position;
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }
            }
        
            v_surfacePos = vec3(u_modelMat * position);
            v_normal = mat3(u_normalMat) * a_normal;
            v_textureCoords = a_textureCoords;
        
            gl_Position = u_finalMat * position;
        }`,
        fShader: (maxModelsCount, maxSpotLightsCount, maxPointLightsCount) => `#version 300 es

        precision highp int;
        precision highp float;
        precision highp sampler2DArray;
        
        struct SpotLight {
            vec3 color;
            vec3 position;
            vec3 direction;
            float shininess;
            float outerLimit;
            float innerLimit;
            float distanceLin;
            float distanceQuad;
            int alphaMapLayers[${maxModelsCount + 1}];
            int alphaMapLayersCount;
        };

        struct PointLight {
            vec3 color;
            vec3 position;
            float shininess;
            float distanceLin;
            float distanceQuad;
            int alphaMapLayers[${maxModelsCount * 6 + 1}];
            int alphaMapLayersCount;
        };

        struct Camera {
            vec3 position;
            float distanceLin;
            float distanceQuad;
        };
        
        uniform vec4 u_color;
        uniform vec3 u_ambientLight;
        uniform sampler2DArray u_spotLightAlphaMap;
        uniform sampler2DArray u_pointLightAlphaMap;
        uniform Camera u_camera;
        uniform SpotLight u_spotLights[${maxSpotLightsCount + 1}];
        uniform int u_spotLightsCount;
        uniform PointLight u_pointLights[${maxPointLightsCount + 1}];
        uniform int u_pointLightsCount;
        
        in vec3 v_normal;
        in vec3 v_surfacePos;
        in vec4 v_fragPosInSpotLightsSpaces[${maxSpotLightsCount + 1}];
        in vec4 v_fragPosInPointLightsSpaces[${maxPointLightsCount * 6 + 1}];
        
        out vec4 color;
        
        float getDistanceFactor(vec3 p, float distanceLin, float distanceQuad) {
            float pointToSurface = distance(v_surfacePos, p);
            float distanceFactor = 1. / (1. + distanceLin * pointToSurface + distanceQuad * pow(pointToSurface, 2.));
        
            return distanceFactor;
        }
        
        float getConeIntensity(SpotLight light, vec3 surfaceToLight) {
            float lightSurfaceCos = dot(normalize(light.direction), -surfaceToLight);
            float coneIntensity = step(light.outerLimit, lightSurfaceCos);
        
            if(coneIntensity == 1.) {
                bool insideConeBorderRange = lightSurfaceCos <= light.innerLimit && lightSurfaceCos >= light.outerLimit;
        
                if(insideConeBorderRange) {
                    float range = light.innerLimit - light.outerLimit;
                    float inRangeVal = light.innerLimit - lightSurfaceCos;
        
                    coneIntensity -= inRangeVal / range;
                }
            }
        
            return coneIntensity;
        }
        
        float getSpotLightTranslucencyFactor(SpotLight light, vec4 fragPosInLightSpace) {
            vec2 projectedCoords = (fragPosInLightSpace.xy / fragPosInLightSpace.w + 1.) / 2.;
            float translucencyFactor = 1.;
        
            for(int i = 0; i < light.alphaMapLayersCount; i++) {
                int layer;
                
                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let layer = 0; layer < maxModelsCount; layer++) {
                            switchBody += `case ${layer}:
                                            layer = light.alphaMapLayers[${layer}];
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }

                translucencyFactor *= 1. - texture(u_spotLightAlphaMap, vec3(projectedCoords, layer)).a;
            }
        
            return translucencyFactor;
        }
        
        vec3 computeSpotLight(SpotLight light, vec4 fragPosInLightSpace) {
            vec3 diffuse = vec3(0);
            vec3 specular = vec3(0);
            float translucencyFactor = 0.;
        
            vec3 normal = normalize(v_normal);
            vec3 surfaceToCamera = normalize(u_camera.position - v_surfacePos);

            bool surfaceInView = dot(normal, surfaceToCamera) > 0.;

            if(surfaceInView) {
                vec3 surfaceToLight = normalize(light.position - v_surfacePos);
                float diffuseLight = max(dot(normal, surfaceToLight), 0.);

                if(diffuseLight > 0.) {
                    float coneIntensity = getConeIntensity(light, surfaceToLight);
                    diffuseLight *= coneIntensity;

                    if(diffuseLight > 0.) {
                        float lightDistanceFactor = getDistanceFactor(light.position, light.distanceLin, light.distanceQuad);
                        float cameraDistanceFactor = getDistanceFactor(u_camera.position, u_camera.distanceLin, u_camera.distanceQuad);
            
                        diffuseLight *= lightDistanceFactor;
                        diffuseLight *= cameraDistanceFactor;
            
                        if(diffuseLight > 0.) {
                            diffuse = diffuseLight * light.color;
                            translucencyFactor = getSpotLightTranslucencyFactor(light, fragPosInLightSpace);
        
                            if(translucencyFactor > 0.) {
                                vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
        
                                specular = pow(max(dot(normal, halfVec), 0.), light.shininess) * coneIntensity * lightDistanceFactor * cameraDistanceFactor * light.color;
                            }
                        }
                    }
                }
            }
        
            return (diffuse + specular) * translucencyFactor;
        }

        float getPointLightTranslucencyFactor(PointLight light, vec4 fragPosInLightSpace, int side) {
            vec2 projectedCoords = (fragPosInLightSpace.xy / fragPosInLightSpace.w + 1.) / 2.;
            float translucencyFactor = 1.;

            int from = light.alphaMapLayersCount * side;
            int to = from + light.alphaMapLayersCount;
        
            for(int i = from; i < to; i++) {
                int layer;
                
                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let i = 0; i < maxModelsCount * 6; i++) {
                            switchBody += `case ${i}:
                                            layer = light.alphaMapLayers[${i}];
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }

                translucencyFactor *= 1. - texture(u_pointLightAlphaMap, vec3(projectedCoords, layer)).a;
            }
        
            return translucencyFactor;
        }
        
        vec3 computePointLight(PointLight light, vec4 fragPosInLightSpace, int side) {
            vec3 diffuse = vec3(0);
            vec3 specular = vec3(0);
            float translucencyFactor = 0.;
        
            vec3 normal = normalize(v_normal);
            vec3 surfaceToCamera = normalize(u_camera.position - v_surfacePos);

            bool surfaceInView = dot(normal, surfaceToCamera) > 0.;

            if(surfaceInView) {
                vec3 surfaceToLight = normalize(light.position - v_surfacePos);
                float diffuseLight = max(dot(normal, surfaceToLight), 0.);

                if(diffuseLight > 0.) {
                    float lightDistanceFactor = getDistanceFactor(light.position, light.distanceLin, light.distanceQuad);
                    float cameraDistanceFactor = getDistanceFactor(u_camera.position, u_camera.distanceLin, u_camera.distanceQuad);
        
                    diffuseLight *= lightDistanceFactor;
                    diffuseLight *= cameraDistanceFactor;
        
                    if(diffuseLight > 0.) {
                        diffuse = diffuseLight * light.color;
                        translucencyFactor = getPointLightTranslucencyFactor(light, fragPosInLightSpace, side);
    
                        if(translucencyFactor > 0.) {
                            vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
    
                            specular = pow(max(dot(normal, halfVec), 0.), light.shininess) * lightDistanceFactor * cameraDistanceFactor * light.color;
                        }
                    }
                }
            }
        
            return (diffuse + specular) * translucencyFactor;
        }

        void main() {
            vec3 lightMix = u_color.rgb * u_ambientLight;
            
            for (int i = 0; i < u_spotLightsCount; i++) {
                SpotLight lightStruct;
                vec4 fragPosInLightSpace;

                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let light = 0; light < maxSpotLightsCount; light++) {
                            switchBody += `case ${light}:
                                            lightStruct = u_spotLights[${light}];
                                            fragPosInLightSpace = v_fragPosInSpotLightsSpaces[${light}];
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }
                
                lightMix += u_color.rgb * computeSpotLight(lightStruct, fragPosInLightSpace);
            }

            for (int i = 0; i < u_pointLightsCount; i++) {
                PointLight lightStruct;

                switch (i) {
                    ${(() => {
                        let switchBody = "";

                        for (let light = 0; light < maxPointLightsCount; light++) {
                            switchBody += `case ${light}:
                                            lightStruct = u_pointLights[${light}];
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }

                float distancePositiveX = distance(v_surfacePos, vec3(lightStruct.position.x + 1., lightStruct.position.y, lightStruct.position.z));
                float distanceNegativeX = distance(v_surfacePos, vec3(lightStruct.position.x - 1., lightStruct.position.y, lightStruct.position.z));
                float distancePositiveY = distance(v_surfacePos, vec3(lightStruct.position.x, lightStruct.position.y + 1., lightStruct.position.z));
                float distanceNegativeY = distance(v_surfacePos, vec3(lightStruct.position.x, lightStruct.position.y - 1., lightStruct.position.z));
                float distancePositiveZ = distance(v_surfacePos, vec3(lightStruct.position.x, lightStruct.position.y, lightStruct.position.z + 1.));
                float distanceNegativeZ = distance(v_surfacePos, vec3(lightStruct.position.x, lightStruct.position.y, lightStruct.position.z - 1.));

                int side = 0;
                float shortestDistance = distancePositiveX;
                
                if (distanceNegativeX < shortestDistance) {
                    side = 1;
                    shortestDistance = distanceNegativeX;
                }

                if (distancePositiveY < shortestDistance) {
                    side = 2;
                    shortestDistance = distancePositiveY;
                }

                if (distanceNegativeY < shortestDistance) {
                    side = 3;
                    shortestDistance = distanceNegativeY;
                }

                if (distancePositiveZ < shortestDistance) {
                    side = 4;
                    shortestDistance = distancePositiveZ;
                }

                if (distanceNegativeZ < shortestDistance) {
                    side = 5;
                    shortestDistance = distanceNegativeZ;
                }
                
                int sideForLight = i * 6 + side;
                vec4 fragPosInLightSpace;

                switch (sideForLight) {
                    ${(() => {
                        let switchBody = "";

                        for (let sideForLight = 0; sideForLight < maxPointLightsCount * 6; sideForLight++) {
                            switchBody += `case ${sideForLight}:
                                            fragPosInLightSpace = v_fragPosInPointLightsSpaces[${sideForLight}];
                                            break;
                                            `;
                        }

                        return switchBody;
                    })()}
                }

                lightMix += u_color.rgb * computePointLight(lightStruct, fragPosInLightSpace, side);
            }

            color = vec4(lightMix, u_color.a);
        }
        `,
    },
    alphaMap: {
        vShader: `#version 300 es

        uniform mat4 u_finalLightMat;
        
        in vec3 a_position;
        
        void main() {
            vec4 position = vec4(a_position, 1.);
        
            gl_Position = u_finalLightMat * position;
        }`,
        fShader: `#version 300 es

        precision highp float;
        
        uniform vec4 u_color;
        
        out vec4 alpha;
        
        void main() {
            alpha = vec4(vec3(0.), u_color.a);
        }`,
    },
};
