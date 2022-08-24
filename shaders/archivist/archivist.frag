#version 300 es

precision highp float;
precision lowp int;

uniform vec3 u_color;
uniform int u_lightActive;
uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;
uniform float u_lightShininess;
uniform float u_lightInnerBorder;
uniform float u_lightOuterBorder;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToCamera;

out vec4 color;

void lightScene() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToCamera = normalize(v_surfaceToCamera);
    vec3 halfVector = normalize(surfaceToLight + surfaceToCamera);

    float dotFromDirection = dot(v_surfaceToLight, -u_lightDirection);
    float shouldLight = smoothstep(u_lightOuterBorder, u_lightInnerBorder, dotFromDirection);
    float light = shouldLight * dot(normal, surfaceToLight);
    float specular = shouldLight * pow(dot(normal, halfVector), u_lightShininess);

    color.rgb *= light;
    color.rgb += specular; // experiment with multiplication
    // color.rgb *= u_lightColor;
}

void main() {
    color = vec4(u_color, 1);

    if(u_lightActive == 1) {
        lightScene();
    }
}
