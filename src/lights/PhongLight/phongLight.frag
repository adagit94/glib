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

const float visibilityBias = 0.02;
const float avgBorder = 2.;
const float avgIterations = pow(avgBorder * 2. + 1., 3.);
const float avgOffset = 0.001;

float getAvgVisibility(vec3 lightToSurface) {
    float currentDepth = length(lightToSurface) / u_far;
    lightToSurface = normalize(lightToSurface);
    float visibility = 0.0;

    for(float x = -avgBorder; x <= avgBorder; x++) {
        for(float y = -avgBorder; y <= avgBorder; y++) {
            for(float z = -avgBorder; z <= avgBorder; z++) {
                float closestDepth = texture(u_depthMap, lightToSurface + vec3(x, y, z) * avgOffset).r;

                visibility += currentDepth - visibilityBias > closestDepth ? 0.0 : 1.0;
            }
        }
    }

    return visibility / avgIterations;
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
