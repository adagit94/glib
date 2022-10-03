#version 300 es

uniform mat4 u_lightMat;
uniform mat4 u_modelMat;

in vec3 a_position;

void main() {
    gl_Position = u_lightMat * u_modelMat * vec4(a_position, 1);
}