#version 300 es

uniform mat4 u_projectionMat;
in vec3 a_position;

void main() {
    gl_Position = u_projectionMat * vec4(a_position, 1);
}