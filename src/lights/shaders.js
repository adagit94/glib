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
        
        uniform vec3 u_color;
        uniform vec3 u_ambientColor;
        uniform vec3 u_lightPosition;
        uniform vec3 u_lightDirection;
        uniform vec3 u_lightColor;
        uniform vec3 u_cameraPosition;
        uniform float u_shininess;
        uniform float u_outerLimit;
        uniform float u_innerLimit;
        uniform float u_distanceConst;
        uniform float u_distanceLin;
        uniform float u_distanceQuad;
        uniform sampler2DShadow u_depthMap;
        
        in vec3 v_normal;
        in vec3 v_surfacePos;
        in vec2 v_textureCoords;
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
        
        float getDistanceFactor() {
            float lightToSurface = distance(v_surfacePos, u_lightPosition);
            float distanceFactor = 1. / (u_distanceConst + u_distanceLin * lightToSurface + u_distanceQuad * pow(lightToSurface, 2.));
        
            return distanceFactor;
        }
        
        float getVisibility() {
            vec3 projectedCoords = (v_fragPosInLightSpace.xyz / v_fragPosInLightSpace.w + 1.) / 2.;
            float currentDepth = projectedCoords.z;
            float visibility = texture(u_depthMap, vec3(projectedCoords.xy, currentDepth - visibilityBias));
        
            return visibility;
        }
        
        void main() {
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);
        
            vec3 diffuseColor = vec3(0);
            vec3 specular = vec3(0);
            float visibility = 0.;
        
            float diffuseLight = max(dot(normal, surfaceToLight), 0.);
        
            if(diffuseLight > 0.) {
                float coneIntensity = getConeIntensity(surfaceToLight);
                diffuseLight *= coneIntensity;
        
                if(diffuseLight > 0.) {
                    float distanceFactor = getDistanceFactor();
                    diffuseLight *= distanceFactor;
        
                    if(diffuseLight > 0.) {
                        diffuseColor = diffuseLight * u_lightColor;
                        visibility = getVisibility();
        
                        if(!isnan(u_shininess)) {
                            vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
                            vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
        
                            specular = pow(max(dot(normal, halfVec), 0.), u_shininess) * u_lightColor * distanceFactor * coneIntensity;
                        }
                    }
                }
            }
        
            color = vec4(u_color, 1);
            color.rgb *= u_ambientColor + diffuseColor * visibility;
            color.rgb += specular * visibility;
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

            precision highp float;
            
            void main() {
                gl_FragDepth = gl_FragCoord.z;
            }`,
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
        
        uniform vec3 u_color;
        uniform float u_far;
        uniform vec3 u_ambientColor;
        uniform vec3 u_lightPosition;
        uniform vec3 u_lightColor;
        uniform vec3 u_cameraPosition;
        uniform float u_shininess;
        uniform float u_distanceConst;
        uniform float u_distanceLin;
        uniform float u_distanceQuad;
        uniform samplerCubeShadow u_depthMap;
        
        in vec3 v_normal;
        in vec3 v_surfacePos;
        in vec2 v_textureCoords;
        
        out vec4 color;
        
        const float visibilityBias = 0.002;
        
        float getDistanceFactor() {
            float lightToSurface = distance(v_surfacePos, u_lightPosition);
            float distanceFactor = 1. / (u_distanceConst + u_distanceLin * lightToSurface + u_distanceQuad * pow(lightToSurface, 2.));
        
            return distanceFactor;
        }
        
        float getVisibility() {
            vec3 lightToSurface = v_surfacePos - u_lightPosition;
            float currentDepth = length(lightToSurface) / u_far;
            float visibility = texture(u_depthMap, vec4(lightToSurface, currentDepth - visibilityBias));
        
            return visibility;
        }
        
        void main() {
            vec3 normal = normalize(v_normal);
            vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);
        
            vec3 diffuseColor = vec3(0);
            vec3 specular = vec3(0);
            float visibility = 0.;
        
            float diffuseLight = max(dot(normal, surfaceToLight), 0.);
        
            if(diffuseLight > 0.) {
                float distanceFactor = getDistanceFactor();
                diffuseLight *= distanceFactor;
        
                if(diffuseLight > 0.) {
                    diffuseColor = diffuseLight * u_lightColor;
                    visibility = getVisibility();
        
                    if(!isnan(u_shininess)) {
                        vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
                        vec3 halfVec = normalize(surfaceToLight + surfaceToCamera);
        
                        specular = pow(max(dot(normal, halfVec), 0.), u_shininess) * u_lightColor * distanceFactor;
                    }
                }
            }
        
            color = vec4(u_color, 1);
            color.rgb *= u_ambientColor + diffuseColor * visibility;
            color.rgb += specular * visibility;
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
    },
};
