#version 300 es

precision highp float;
precision lowp int;

uniform vec3 u_color;
uniform int u_lightActive;
uniform vec3 u_lightDirection;

in vec3 v_normal;

out vec4 color;

void main() {
    color = vec4(u_color, 1);

    if(u_lightActive == 1) {
        vec3 normal = normalize(v_normal);
        float light = dot(normal, -u_lightDirection);
        color.rgb *= light;
    }
}
