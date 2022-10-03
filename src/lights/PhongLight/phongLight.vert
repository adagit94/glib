#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_modelMat;
uniform mat4 u_normalMat;
uniform mat4 u_lightMat;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureCoords;

out vec3 v_surfacePos;
out vec3 v_normal;
out vec2 v_textureCoords;

void main() {
    vec4 position = vec4(a_position, 1.);

    v_surfacePos = vec3(u_modelMat * position);
    v_normal = mat3(u_normalMat) * a_normal;
    v_textureCoords = a_textureCoords;

    gl_Position = u_finalMat * position;
}