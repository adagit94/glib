export default {
    scene: {
        vShader: (maxSpotLightsCount, maxPointLightsCount) => `#version 300 es
        precision highp int;
        precision highp float;
        
        uniform int u_useBufferColor;
        uniform vec4 u_color;
        uniform mat4 u_finalMat;
        uniform mat4 u_modelMat;
        uniform mat4 u_normalMat;
        uniform mat4 u_finalSpotLightsMats[${maxSpotLightsCount + 1}];
        uniform int u_spotLightsCount;
        uniform mat4 u_finalPointLightsMats[${maxPointLightsCount * 6 + 1}];
        uniform int u_pointLightsCount;
        
        in vec3 a_position;
        in vec3 a_normal;
        in vec4 a_color;
        in vec2 a_textureCoords;
        
        out vec3 v_surfacePos;
        out vec3 v_normal;
        out vec4 v_color;
        out vec2 v_textureCoords;
        out vec4 v_fragPosInSpotLightsSpaces[${maxSpotLightsCount + 1}];
        out vec4 v_fragPosInPointLightsSpaces[${maxPointLightsCount * 6 + 1}];
        
        void main() {
            vec4 position = vec4(a_position, 1.);

            for(int i = 0; i < u_spotLightsCount; i++) {
                ${generateSwitch(maxSpotLightsCount, i => `v_fragPosInSpotLightsSpaces[${i}] = u_finalSpotLightsMats[${i}] * position;`)}
            }

            for(int i = 0; i < u_pointLightsCount * 6; i++) {
                ${generateSwitch(maxPointLightsCount * 6, i => `v_fragPosInPointLightsSpaces[${i}] = u_finalPointLightsMats[${i}] * position;`)}
            }

            v_surfacePos = vec3(u_modelMat * position);
            v_normal = mat3(u_normalMat) * a_normal;
            v_color = u_useBufferColor == 1 ? a_color : u_color;
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
        
        uniform vec3 u_ambientLight;
        uniform sampler2DArray u_spotLightAlphaMap;
        uniform sampler2DArray u_pointLightAlphaMap;
        uniform Camera u_camera;
        uniform SpotLight u_spotLights[${maxSpotLightsCount + 1}];
        uniform int u_spotLightsCount;
        uniform PointLight u_pointLights[${maxPointLightsCount + 1}];
        uniform int u_pointLightsCount;
        
        in vec3 v_normal;
        in vec4 v_color;
        in vec3 v_surfacePos;
        in vec4 v_fragPosInSpotLightsSpaces[${maxSpotLightsCount + 1}];
        in vec4 v_fragPosInPointLightsSpaces[${maxPointLightsCount * 6 + 1}];
        
        out vec4 outputColor;

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
                
                ${generateSwitch(maxModelsCount, i => `layer = light.alphaMapLayers[${i}];`)}
                
                translucencyFactor *= 1. - texture(u_spotLightAlphaMap, vec3(projectedCoords, layer)).a;
                if (translucencyFactor == 0.) break;
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
                
                ${generateSwitch(maxModelsCount * 6, i => `layer = light.alphaMapLayers[${i}];`)}

                translucencyFactor *= 1. - texture(u_pointLightAlphaMap, vec3(projectedCoords, layer)).a;
                if (translucencyFactor == 0.) break;
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
            vec4 inputColor = v_color;
            vec3 lightMix = inputColor.rgb * u_ambientLight;
            
            for (int i = 0; i < u_spotLightsCount; i++) {
                SpotLight lightStruct;
                vec4 fragPosInLightSpace;

                ${generateSwitch(
                    maxSpotLightsCount,
                    i => `lightStruct = u_spotLights[${i}]; fragPosInLightSpace = v_fragPosInSpotLightsSpaces[${i}];`
                )}
                
                lightMix += inputColor.rgb * computeSpotLight(lightStruct, fragPosInLightSpace);
            }

            for (int i = 0; i < u_pointLightsCount; i++) {
                PointLight lightStruct;

                ${generateSwitch(maxPointLightsCount, i => `lightStruct = u_pointLights[${i}];`)}
                
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

                ${generateSwitch(maxPointLightsCount * 6, i => `fragPosInLightSpace = v_fragPosInPointLightsSpaces[${i}];`, "sideForLight")}

                lightMix += inputColor.rgb * computePointLight(lightStruct, fragPosInLightSpace, side);
            }

            outputColor = vec4(lightMix, inputColor.a);
        }
        `,
    },
    alphaMap: {
        vShader: `#version 300 es
        precision lowp int;
        
        uniform int u_useBufferColor;
        uniform vec4 u_color;
        uniform mat4 u_finalLightMat;
        
        in vec3 a_position;
        in vec4 a_color;

        out vec4 v_color;
        
        void main() {
            vec4 position = vec4(a_position, 1.);

            v_color = u_useBufferColor == 1 ? a_color : u_color;
        
            gl_Position = u_finalLightMat * position;
        }`,
        fShader: `#version 300 es
        precision highp float;
        
        in vec4 v_color;
        
        out vec4 alpha;
        
        void main() {
            alpha = vec4(vec3(0.), v_color.a);
        }`,
    },
};

const generateSwitch = (iterations, generateCase, switchVar = "i") => {
    let switchBody = "";

    for (let i = 0; i < iterations; i++) {
        switchBody += `case ${i}:
                        ${generateCase(i)}
                        break;
                        `;
    }

    return `switch (${switchVar}) {
                ${switchBody}
            }`;
};
