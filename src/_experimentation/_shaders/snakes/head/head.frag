#version 300 es

precision highp float;

uniform float u_shade;
in float x;
in float y;
out vec4 color;

void main() {
    color = vec4(vec3(u_shade), 1);
}