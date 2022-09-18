#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_objectToLightMat;
uniform mat4 u_objectToLightInversedTransposedMat;
uniform vec3 u_lightPosition;
uniform vec3 u_cameraPosition;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_surfaceToLight;
out vec3 v_surfaceToCamera;
out vec3 v_normal;

void main() {
    vec4 position = vec4(a_position, 1.);
    vec3 surfacePos = vec3(u_objectToLightMat * position);

    v_surfaceToLight = u_lightPosition - surfacePos;
    v_surfaceToCamera = u_cameraPosition - surfacePos;
    v_normal = mat3(u_objectToLightInversedTransposedMat) * a_normal;

    gl_Position = u_finalMat * position;
}