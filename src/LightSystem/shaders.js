export default {
    spot: {
        vShader: `#version 300 es

        uniform mat4 u_finalMat;
        uniform mat4 u_modelMat;
        uniform mat4 u_normalMat;
        uniform mat4 u_finalLightMat;
        
        in vec3 a_position;
        in vec3 a_normal;
        in vec2 a_textureCoords;
        
        out vec3 v_surfacePos;
        out vec3 v_normal;
        out vec2 v_textureCoords;
        out vec4 v_fragPosInLightSpace;
        
        void main() {
            vec4 position = vec4(a_position, 1);
        
            v_surfacePos = vec3(u_modelMat * position);
            v_normal = mat3(u_normalMat) * a_normal;
            v_textureCoords = a_textureCoords;
            v_fragPosInLightSpace = u_finalLightMat * position;
        
            gl_Position = u_finalMat * position;
        }`,
        fShader: `#version 300 es

        precision highp float;
        precision highp sampler2DShadow;
        
        uniform vec4 u_color;
        uniform vec3 u_ambientColor;
        uniform vec3 u_lightPosition;
        uniform vec3 u_lightDirection;
        uniform vec3 u_lightColor;
        uniform vec3 u_cameraPosition;
        uniform float u_shininess;
        uniform float u_outerLimit;
        uniform float u_innerLimit;
        uniform float u_lightDistanceLin;
        uniform float u_lightDistanceQuad;
        uniform float u_cameraDistanceLin;
        uniform float u_cameraDistanceQuad;
        uniform sampler2DShadow u_depthMap;
        uniform int u_shadows;
        
        in vec3 v_normal;
        in vec3 v_surfacePos;
        in vec4 v_fragPosInLightSpace;
        
        out vec4 color;
        
        const float visibilityBias = 0.002;
        
        float getConeIntensity(vec3 surfaceToLight) {
            float lightSurfaceCos = dot(normalize(u_lightDirection), -surfaceToLight);
            float coneIntensity = step(u_outerLimit, lightSurfaceCos);
        
            if(coneIntensity == 1.) {
                bool insideConeBorderRange = lightSurfaceCos <= u_innerLimit && lightSurfaceCos >= u_outerLimit;
        
                if(insideConeBorderRange) {
                    float range = u_innerLimit - u_outerLimit;
                    float inRangeVal = u_innerLimit - lightSurfaceCos;
        
                    coneIntensity -= inRangeVal / range;
                }
            }
        
            return coneIntensity;
        }
        
        float getDistanceFactor(vec3 p, float distanceLin, float distanceQuad) {
            float lightToPoint = distance(v_surfacePos, p);
            float distanceFactor = 1. / (1. + distanceLin * lightToPoint + distanceQuad * pow(lightToPoint, 2.));
        
            return distanceFactor;
        }
        
        float getVisibility() {
            vec3 projectedCoords = (v_fragPosInLightSpace.xyz / v_fragPosInLightSpace.w + 1.) / 2.;
            float currentDepth = projectedCoords.z;
            float visibility = texture(u_depthMap, vec3(projectedCoords.xy, currentDepth - visibilityBias));
        
            return visibility;
        }
        
        void main() {
            vec3 diffuseColor = vec3(0);
            vec3 specular = vec3(0);
        
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);
        
            float diffuseLight = max(dot(normal, surfaceToLight), 0.);
        
            if(diffuseLight > 0.) {
                float coneIntensity = getConeIntensity(surfaceToLight);
                diffuseLight *= coneIntensity;
        
                if(diffuseLight > 0.) {
                    float lightDistanceFactor = getDistanceFactor(u_lightPosition, u_lightDistanceLin, u_lightDistanceQuad);
                    float cameraDistanceFactor = getDistanceFactor(u_cameraPosition, u_cameraDistanceLin, u_cameraDistanceQuad);
        
                    diffuseLight *= lightDistanceFactor;
                    diffuseLight *= cameraDistanceFactor;
        
                    if(diffuseLight > 0.) {
                        float visibility = u_shadows == 1 ? getVisibility() : 1.;
                        diffuseLight *= visibility;
        
                        if(diffuseLight > 0.) {
                            diffuseColor = diffuseLight * u_lightColor;
        
                            if(!isnan(u_shininess)) {
                                vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
                                vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
        
                                specular = pow(max(dot(normal, halfVec), 0.), u_shininess) * coneIntensity * lightDistanceFactor * cameraDistanceFactor * visibility * u_lightColor;
                            }
                        }
                    }
                }
            }
        
            color = u_color;
            color.rgb *= u_ambientColor + diffuseColor;
            color.rgb += specular;
        }                        
        `,
        depthMap: {
            vShader: `#version 300 es

            uniform mat4 u_finalLightMat;
            
            in vec3 a_position;
            
            void main() {
                gl_Position = u_finalLightMat * vec4(a_position, 1);
            }`,
            fShader: `#version 300 es

            void main() {
                gl_FragDepth = gl_FragCoord.z;
            }`,
        },
        lightIntensityMap: {
            vShader: `#version 300 es

            uniform mat4 u_finalLightMat;
            uniform mat4 u_modelMat;
            in vec3 a_position;
            out vec3 v_surfacePos;
            
            void main() {
                vec4 position = vec4(a_position, 1);
            
                v_surfacePos = vec3(u_modelMat * position);
                gl_Position = u_finalLightMat * position;
            }`,
            fShader: `#version 300 es
            #define texturesCount 16
            
            precision highp float;
            precision highp samplerCube;
            
            uniform vec4 u_color;
            uniform vec3 u_lightPosition;
            uniform samplerCube u_lightIntensityMaps[texturesCount];
            uniform int u_closestLightIntensityMapIndex;
            in vec3 v_surfacePos;
            out vec4 color;
            
            float getClosestDiminution() {
                vec3 lightToSurface = v_surfacePos - u_lightPosition;
                float closestSample = 0.;
            
                for(int mapI = u_closestLightIntensityMapIndex; mapI >= 0; mapI--) {
                    switch(mapI) {
                        case 0:
                            closestSample = texture(u_lightIntensityMaps[0], lightToSurface).a;
                            break;
                        case 1:
                            closestSample = texture(u_lightIntensityMaps[1], lightToSurface).a;
                            break;
                        case 2:
                            closestSample = texture(u_lightIntensityMaps[2], lightToSurface).a;
                            break;
                        case 3:
                            closestSample = texture(u_lightIntensityMaps[3], lightToSurface).a;
                            break;
                        case 4:
                            closestSample = texture(u_lightIntensityMaps[4], lightToSurface).a;
                            break;
                        case 5:
                            closestSample = texture(u_lightIntensityMaps[5], lightToSurface).a;
                            break;
                        case 6:
                            closestSample = texture(u_lightIntensityMaps[6], lightToSurface).a;
                            break;
                        case 7:
                            closestSample = texture(u_lightIntensityMaps[7], lightToSurface).a;
                            break;
                        case 8:
                            closestSample = texture(u_lightIntensityMaps[8], lightToSurface).a;
                            break;
                        case 9:
                            closestSample = texture(u_lightIntensityMaps[9], lightToSurface).a;
                            break;
                        case 10:
                            closestSample = texture(u_lightIntensityMaps[10], lightToSurface).a;
                            break;
                        case 11:
                            closestSample = texture(u_lightIntensityMaps[11], lightToSurface).a;
                            break;
                        case 12:
                            closestSample = texture(u_lightIntensityMaps[12], lightToSurface).a;
                            break;
                        case 13:
                            closestSample = texture(u_lightIntensityMaps[13], lightToSurface).a;
                            break;
                        case 14:
                            closestSample = texture(u_lightIntensityMaps[14], lightToSurface).a;
                            break;
                        case 15:
                            closestSample = texture(u_lightIntensityMaps[15], lightToSurface).a;
                            break;
                    }
            
                    if(closestSample > 0.) {
                        break;
                    }
                }
            
                return closestSample;
            }
            
            void main() {
                float lightDiminution = getClosestDiminution();
            
                color = vec4(1. - lightDiminution, 0, 0, clamp(u_color.a + lightDiminution, 0., 1.));
            }
            `,
        },
    },
    point: {
        vShader: `#version 300 es

        uniform mat4 u_finalMat;
        uniform mat4 u_modelMat;
        uniform mat4 u_normalMat;
        
        in vec3 a_position;
        in vec3 a_normal;
        in vec2 a_textureCoords;
        
        out vec3 v_surfacePos;
        out vec3 v_normal;
        out vec2 v_textureCoords;
        
        void main() {
            vec4 position = vec4(a_position, 1);
        
            v_surfacePos = vec3(u_modelMat * position);
            v_normal = mat3(u_normalMat) * a_normal;
            v_textureCoords = a_textureCoords;
        
            gl_Position = u_finalMat * position;
        }`,
        fShader: `#version 300 es

        precision highp float;
        precision highp samplerCubeShadow;
        
        uniform vec4 u_color;
        uniform vec3 u_ambientColor;
        uniform vec3 u_lightPosition;
        uniform vec3 u_lightColor;
        uniform vec3 u_cameraPosition;
        uniform float u_shininess;
        uniform float u_lightDistanceLin;
        uniform float u_lightDistanceQuad;
        uniform float u_cameraDistanceLin;
        uniform float u_cameraDistanceQuad;
        uniform float u_far;
        uniform samplerCubeShadow u_depthMap;
        uniform samplerCube u_lightIntensityMap;
        uniform int u_shadows;
        uniform int u_transparency;
        
        in vec3 v_normal;
        in vec3 v_surfacePos;
        
        out vec4 color;
        
        const float visibilityBias = 0.002;
        
        float getDistanceFactor(vec3 p, float distanceLin, float distanceQuad) {
            float lightToPoint = distance(v_surfacePos, p);
            float distanceFactor = 1. / (1. + distanceLin * lightToPoint + distanceQuad * pow(lightToPoint, 2.));
        
            return distanceFactor;
        }
        
        float getVisibility() {
            vec3 lightToSurface = v_surfacePos - u_lightPosition;
            float currentDepth = length(lightToSurface) / u_far;
            float visibility = texture(u_depthMap, vec4(lightToSurface, currentDepth - visibilityBias));
        
            return visibility;
        }
        
        float getFragLightIntensity() {
            vec3 lightToSurface = v_surfacePos - u_lightPosition;
            float intensity = texture(u_lightIntensityMap, lightToSurface).r;
        
            return intensity;
        }
        
        void main() {
            vec3 diffuseColor = vec3(0);
            vec3 specular = vec3(0);
        
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);
        
            float diffuseLight = max(dot(normal, surfaceToLight), 0.);
        
            if(diffuseLight > 0.) {
                float lightDistanceFactor = getDistanceFactor(u_lightPosition, u_lightDistanceLin, u_lightDistanceQuad);
                float cameraDistanceFactor = getDistanceFactor(u_cameraPosition, u_cameraDistanceLin, u_cameraDistanceQuad);
        
                diffuseLight *= lightDistanceFactor;
                diffuseLight *= cameraDistanceFactor;
        
                if(diffuseLight > 0.) {
                    float visibility = u_shadows == 1 ? getVisibility() : 1.;
                    diffuseLight *= visibility;
        
                    if(diffuseLight > 0.) {
                        diffuseColor = diffuseLight * u_lightColor;
        
                        if(!isnan(u_shininess)) {
                            vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
                            vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
        
                            specular = pow(max(dot(normal, halfVec), 0.), u_shininess) * lightDistanceFactor * cameraDistanceFactor * visibility * u_lightColor;
                        }
                    }
                }
            }
        
            float fragLightIntensity = u_transparency == 1 ? getFragLightIntensity() : 1.;
        
            color = vec4(u_color.rgb, u_transparency == 1 ? u_color.a : 1.);
            color.rgb *= u_ambientColor + diffuseColor * fragLightIntensity + specular * fragLightIntensity;
        }
        `,
        depthMap: {
            vShader: `#version 300 es

        uniform mat4 u_finalLightMat;
            uniform mat4 u_modelMat;
            
            in vec3 a_position;
            
            out vec3 v_surfacePosition;
            
            void main() {
                vec4 position = vec4(a_position, 1);
            
                v_surfacePosition = vec3(u_modelMat * position);
                gl_Position = u_finalLightMat * position;
            }`,
            fShader: `#version 300 es

            precision highp float;
            
            uniform float u_far;
            uniform vec3 u_lightPosition;
            
            in vec3 v_surfacePosition;
            
            void main() {
                float lightToSurfaceDistance = distance(v_surfacePosition, u_lightPosition);
            
                gl_FragDepth = lightToSurfaceDistance / u_far;
            }`,
        },
        lightIntensityMap: {
            vShader: `#version 300 es

            uniform mat4 u_finalLightMat;
            uniform mat4 u_modelMat;
            in vec3 a_position;
            out vec3 v_surfacePos;
            
            void main() {
                vec4 position = vec4(a_position, 1);
            
                v_surfacePos = vec3(u_modelMat * position);
                gl_Position = u_finalLightMat * position;
            }`,
            fShader: `#version 300 es
            #define texturesCount 16
            
            precision highp float;
            precision highp samplerCube;
            
            uniform vec4 u_color;
            uniform vec3 u_lightPosition;
            uniform samplerCube u_lightIntensityMaps[texturesCount];
            uniform int u_closestLightIntensityMapIndex;
            in vec3 v_surfacePos;
            out vec4 color;
            
            float getClosestDiminution() {
                vec3 lightToSurface = v_surfacePos - u_lightPosition;
                float closestSample = 0.;
            
                for(int mapI = u_closestLightIntensityMapIndex; mapI >= 0; mapI--) {
                    switch(mapI) {
                        case 0:
                            closestSample = texture(u_lightIntensityMaps[0], lightToSurface).a;
                            break;
                        case 1:
                            closestSample = texture(u_lightIntensityMaps[1], lightToSurface).a;
                            break;
                        case 2:
                            closestSample = texture(u_lightIntensityMaps[2], lightToSurface).a;
                            break;
                        case 3:
                            closestSample = texture(u_lightIntensityMaps[3], lightToSurface).a;
                            break;
                        case 4:
                            closestSample = texture(u_lightIntensityMaps[4], lightToSurface).a;
                            break;
                        case 5:
                            closestSample = texture(u_lightIntensityMaps[5], lightToSurface).a;
                            break;
                        case 6:
                            closestSample = texture(u_lightIntensityMaps[6], lightToSurface).a;
                            break;
                        case 7:
                            closestSample = texture(u_lightIntensityMaps[7], lightToSurface).a;
                            break;
                        case 8:
                            closestSample = texture(u_lightIntensityMaps[8], lightToSurface).a;
                            break;
                        case 9:
                            closestSample = texture(u_lightIntensityMaps[9], lightToSurface).a;
                            break;
                        case 10:
                            closestSample = texture(u_lightIntensityMaps[10], lightToSurface).a;
                            break;
                        case 11:
                            closestSample = texture(u_lightIntensityMaps[11], lightToSurface).a;
                            break;
                        case 12:
                            closestSample = texture(u_lightIntensityMaps[12], lightToSurface).a;
                            break;
                        case 13:
                            closestSample = texture(u_lightIntensityMaps[13], lightToSurface).a;
                            break;
                        case 14:
                            closestSample = texture(u_lightIntensityMaps[14], lightToSurface).a;
                            break;
                        case 15:
                            closestSample = texture(u_lightIntensityMaps[15], lightToSurface).a;
                            break;
                    }
            
                    if(closestSample > 0.) {
                        break;
                    }
                }
            
                return closestSample;
            }
            
            void main() {
                float lightDiminution = getClosestDiminution();
            
                color = vec4(1. - lightDiminution, 0, 0, clamp(u_color.a + lightDiminution, 0., 1.));
            }
            `,
        },
    },
};
