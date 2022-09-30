#version 300 es

precision highp float;

uniform vec3 u_color;
// in float x;
// in float y;
out vec4 color;

void main() {
    color = vec4(u_color, 1);
}