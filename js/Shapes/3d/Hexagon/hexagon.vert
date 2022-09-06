#version 300 es

uniform mat4 u_mat;

in vec3 a_position;
out float z;

void main() {
    z = a_position.z;
    gl_Position = u_mat * vec4(a_position, 1);
}