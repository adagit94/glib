#version 300 es

uniform mat4 u_mat;

in vec3 a_position;
in vec2 a_textureCoords;

out vec2 v_textureCoords;

void main() {
    v_textureCoords = a_textureCoords;
    gl_Position = u_mat * vec4(a_position, 1);
}