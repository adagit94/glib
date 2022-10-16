#version 300 es

precision highp float;
precision highp samplerCubeShadow;

uniform vec3 u_color;
uniform float u_far;
uniform vec3 u_ambientColor;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform float u_shininess;
uniform samplerCubeShadow u_depthMap;

in vec3 v_normal;
in vec3 v_surfacePos;
in vec2 v_textureCoords;

out vec4 color;

const float visibilityBias = 0.002;

float getVisibility(vec3 lightToSurface) {
    float currentDepth = length(lightToSurface) / u_far;
    float visibility = texture(u_depthMap, vec4(lightToSurface, currentDepth - visibilityBias));

    return visibility;
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);

    float diffuseLight = max(dot(normal, surfaceToLight), 0.);
    vec3 diffuseColor = diffuseLight * u_lightColor;
    vec3 specular = vec3(0);

    if(diffuseLight > 0. && !isnan(u_shininess)) {
        vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
        vec3 reflectedLightRay = reflect(-surfaceToLight, normal);

        specular = pow(max(dot(surfaceToCamera, reflectedLightRay), 0.), u_shininess) * u_lightColor;
    }

    float visibility = getVisibility(v_surfacePos - u_lightPosition);

    color = vec4(u_color, 1);
    color.rgb *= u_ambientColor + diffuseColor * visibility;
    color.rgb += specular * visibility;
}
