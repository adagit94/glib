#version 300 es

precision highp float;

uniform vec3 u_color;
out vec4 color;
vec3 inputColor;

void main() {
    color = vec4(inputColor, 1);
}