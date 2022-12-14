#version 300 es

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
uniform int u_shadows;

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

    color = u_color;
    color.rgb *= u_ambientColor + diffuseColor;
    color.rgb += specular;
}
