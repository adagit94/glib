#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_objectToLightMat;
uniform vec3 u_lightPosition;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_surfaceToLight;
out vec3 v_normal;

void main() {
    vec3 surfacePos = mat3(u_objectToLightMat) * a_position;

    v_surfaceToLight = u_lightPosition - surfacePos;
    v_normal = a_normal;

    gl_Position = u_finalMat * vec4(a_position, 1);
}