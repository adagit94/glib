#version 300 es

precision highp float;

uniform vec3 u_color;
uniform vec3 u_ambientColor;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform float u_shininess;
uniform sampler2D u_texture;
uniform sampler2D u_depthMap;

in vec3 v_normal;
in vec3 v_surfacePos;
in vec4 v_surfacePosInLightSpace;
in vec2 v_textureCoords;

out vec4 color;

float computeShadow() {
    vec3 projectedSurfacePosInLightSpace = v_surfacePosInLightSpace.xyz / v_surfacePosInLightSpace.w;
}

void main() {
    vec3 texColor = texture(u_texture, v_textureCoords).rgb;

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

    float shadow = computeShadow();

    color = vec4(u_color, 1);
    color.rgb *= u_ambientColor + diffuseColor * shadow;
    color.rgb += specular * shadow;
}
