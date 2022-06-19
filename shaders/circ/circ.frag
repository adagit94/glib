#version 300 es

precision highp float;

uniform int u_side;
in float x;
in float y;
out vec4 color;
float opacityDivider;
float yBasedOpacity;

void main() {
    // Y BASED LIGHTING
    if(u_side == 0) {
        yBasedOpacity = (y + 1.) / 2. * 0.4;
        yBasedOpacity = 0.7 + yBasedOpacity;
    } else {
        yBasedOpacity = (y + 1.) / 2. * 0.6;
        yBasedOpacity = 0.5 + yBasedOpacity;
        // yBasedOpacity = 0.5 + yBasedOpacity;
    }

    color = vec4(0, 0, 1, yBasedOpacity);

    // light to top of the head
    // opacityDivider = u_side == 1 ? 1.5 : 1.75;
    // color = vec4(0, 0, 1, 1. - y / opacityDivider);

    // angelic curves
    // color = vec4(0, 0, 1, 1. - (abs(x) + abs(y)) / 2.);

// zkusit (x * (width / 300)) / width  (y * (height / 300)) / height
    // concentric circles
    // color = vec4(0.5 + ((y + 1.) / 2.) * 0.5, 0, 0, 1);
    // color = vec4(0.5 + ((y + 1.) / 2.) * 0.5, 0, 0, 1);
}