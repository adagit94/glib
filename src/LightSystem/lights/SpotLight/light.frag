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
