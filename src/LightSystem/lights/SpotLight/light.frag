#version 300 es

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
uniform float u_lightDistanceLin;
uniform float u_lightDistanceQuad;
uniform float u_cameraDistanceLin;
uniform float u_cameraDistanceQuad;
uniform sampler2DShadow u_depthMap;

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
                float visibility = getVisibility();
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

    color = vec4(u_color, 1);
    color.rgb *= u_ambientColor + diffuseColor;
    color.rgb += specular;
}
