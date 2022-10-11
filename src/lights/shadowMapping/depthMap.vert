#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_modelMat;

in vec3 a_position;

out vec3 v_surfacePosition;

void main() {
    vec4 position = vec4(a_position, 1);

    v_surfacePosition = vec3(u_modelMat * position);
    gl_Position = u_finalMat * position;
}