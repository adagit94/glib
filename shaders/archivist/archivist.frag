#version 300 es

precision highp float;

uniform vec3 u_reversedLight;
uniform vec3 u_color;

in vec3 v_normal;

out vec4 color;

vec3 normal;
float light;

void main() {
    normal = normalize(v_normal);
    light = dot(normal, u_reversedLight);

    color = vec4(u_color, 1);
    color.rgb *= light;
}