#version 300 es

uniform mat4 u_finalLightMat;

in vec3 a_position;

void main() {
    gl_Position = u_finalLightMat * vec4(a_position, 1);
}