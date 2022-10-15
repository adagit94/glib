#version 300 es

precision highp float;

uniform vec3 u_color;
uniform float u_far;
uniform vec3 u_ambientColor;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform float u_shininess;
uniform samplerCube u_depthMap;

in vec3 v_normal;
in vec3 v_surfacePos;
in vec2 v_textureCoords;

out vec4 color;

const float bias = 0.02;

float getAvgVisibility(vec3 lightToSurface) {
    float currentDepth = length(lightToSurface) / u_far;
    lightToSurface = normalize(lightToSurface);
    float visibility = 0.0;

    for(int x = -2; x <= 2; x++) {
        for(int y = -2; y <= 2; y++) {
            for(int z = -2; z <= 2; z++) {
                float closestDepth = texture(u_depthMap, lightToSurface + vec3(x, y, z) * 0.02).r;

                visibility += currentDepth - bias > closestDepth ? 0.0 : 1.0;
            }
        }
    }

    return visibility / 125.;
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

    float visibility = getAvgVisibility(v_surfacePos - u_lightPosition);

    color = vec4(u_color, 1);
    color.rgb *= u_ambientColor + diffuseColor * visibility;
    color.rgb += specular * visibility;
}
