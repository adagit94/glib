#version 300 es

precision lowp int;

uniform mat4 u_mat;
uniform mat4 u_worldMat;
uniform mat4 u_worldInversedTransposedMat;
uniform int u_lightActive;
uniform vec3 u_lightPosition;
uniform vec3 u_cameraPosition;

in vec3 a_position;
in vec3 a_normal;

out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToCamera;

void computeLightVaryings() {
    vec3 surfacePos = mat3(u_worldMat) * a_position;

    v_normal = mat3(u_worldInversedTransposedMat) * a_normal;
    v_surfaceToLight = u_lightPosition - surfacePos;
    v_surfaceToCamera = u_cameraPosition - surfacePos;
}

void main() {
    if(u_lightActive == 1) {
        computeLightVaryings();
    }

    gl_Position = u_mat * vec4(a_position, 1);
}