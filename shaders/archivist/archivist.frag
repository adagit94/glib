#version 300 es

precision highp float;

uniform vec3 u_color;
uniform vec3 u_lightColor;
uniform float u_shininess;
// uniform vec3 u_lightDirection;
// uniform float u_lightAngle;
// uniform vec3 u_lightColor;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToCamera;

out vec4 color;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToCamera = normalize(v_surfaceToCamera);
    vec3 halfVector = normalize(surfaceToLight + surfaceToCamera);
    float light = dot(normal, surfaceToLight);
    float specular;

    color = vec4(u_color, 1);

    color.rgb *= light;

    if(light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
        color.rgb += specular; // experiment with multiplication
    }

    color.rgb *= u_lightColor;
}