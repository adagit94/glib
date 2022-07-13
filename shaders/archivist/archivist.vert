#version 300 es

uniform mat4 u_mat;
in vec4 a_position;

void main() {
    gl_Position = u_mat * a_position;
}