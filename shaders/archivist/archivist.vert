#version 300 es

uniform mat4 u_mat;
uniform mat4 u_headMat;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_normal;

void main() {
    v_normal = mat3(u_headMat) * a_normal;

    gl_Position = u_mat * vec4(a_position, 1);
}