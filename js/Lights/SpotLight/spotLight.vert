#version 300 es

uniform mat4 u_finalMat;
uniform mat4 u_objectToLightMat;
uniform mat4 u_objectToLightInversedTransposedMat;
uniform vec3 u_lightPosition;
uniform vec3 u_cameraPosition;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToCamera;

void main() {
    vec3 surfacePos = mat3(u_objectToLightMat) * a_position;

    v_normal = mat3(u_objectToLightInversedTransposedMat) * a_normal;
    v_surfaceToLight = u_lightPosition - surfacePos;
    v_surfaceToCamera = u_cameraPosition - surfacePos;
    
    gl_Position = u_finalMat * vec4(a_position, 1);
}