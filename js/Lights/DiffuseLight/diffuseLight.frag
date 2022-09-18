#version 300 es

precision highp float;

uniform vec3 u_color;
uniform vec3 u_lightColor;

in vec3 v_normal;
in vec3 v_surfaceToLight;

out vec4 color;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);

    float light = dot(normal, surfaceToLight);

    color = vec4(u_color, 1);

    color.rgb *= light * u_lightColor;
}
