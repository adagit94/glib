#version 300 es

precision lowp int;

uniform mat4 u_mat;
uniform mat4 u_inversedTransposedHeadMat;
uniform int u_lightActive;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_normal;

void main() {
    if(u_lightActive == 1) {
        v_normal = mat3(u_inversedTransposedHeadMat) * a_normal;
    }

    gl_Position = u_mat * vec4(a_position, 1);
}