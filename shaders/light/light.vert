#version 300 es

uniform mat3 u_mat;
uniform float u_zIndex;

in vec2 a_position;
out float x;
out float y;

vec3 coordinates;
float z;

void main() {
    coordinates = u_mat * vec3(a_position, 1);

    x = coordinates.x;
    y = coordinates.y;
    z = u_zIndex;

    if(isnan(z)) {
        z = 1.;
    }

    gl_Position = vec4(coordinates.xy, z, 1);
}