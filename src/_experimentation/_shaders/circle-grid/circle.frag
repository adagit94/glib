#version 300 es

precision highp float;

uniform vec3 u_color;
in float x;
in float y;
out vec4 color;
vec3 inputColor;

void main() {
    inputColor = u_color;

    if(isnan(inputColor.r)) {
        inputColor = vec3(0);
    }

    color = vec4(inputColor, 1);
}