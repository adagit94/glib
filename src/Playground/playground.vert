#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_textureMat;
uniform mat4 u_modelMat;

in vec3 a_position;
in vec2 a_textureCoords;

out vec2 v_textureCoords;
out vec4 v_projectedTextureCoords;

void main() {
    v_textureCoords = a_textureCoords;
    v_projectedTextureCoords = u_textureMat * u_modelMat * vec4(a_position, 1.);

    gl_Position = u_finalMat * vec4(a_position, 1);
}