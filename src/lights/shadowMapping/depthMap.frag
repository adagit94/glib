#version 300 es

precision highp float;

uniform float u_far;
uniform vec3 u_lightPosition;

in vec3 v_surfacePosition;

out vec4 color;

void main() {
    float lightToSurfaceDistance = distance(v_surfacePosition, u_lightPosition);

    gl_FragDepth = lightToSurfaceDistance / u_far;
    // color = vec4(vec3(lightToSurfaceDistance / u_far), 1);
}