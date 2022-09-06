#version 300 es

precision highp float;

uniform vec3 u_color;

out vec4 color;
in float z;

void main() {
    color = vec4(u_color.rg, 0.25 + abs(z), 1);
}