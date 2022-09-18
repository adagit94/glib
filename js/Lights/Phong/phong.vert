#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_modelMat;
uniform mat4 u_normalMat;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_surfacePos;
out vec3 v_normal;

void main() {
    vec4 position = vec4(a_position, 1.);

    v_surfacePos = vec3(u_modelMat * position);
    v_normal = mat3(u_normalMat) * a_normal;

    gl_Position = u_finalMat * position;
}