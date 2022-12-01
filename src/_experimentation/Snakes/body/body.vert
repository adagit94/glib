#version 300 es

uniform mat3 u_mat;

in vec2 a_position;
out float x;
out float y;

vec3 coordinates;

void main() {
    coordinates = u_mat * vec3(a_position, 1);

    x = coordinates.x;
    y = coordinates.y;

    gl_Position = vec4(coordinates.xy, 0, 1);
}