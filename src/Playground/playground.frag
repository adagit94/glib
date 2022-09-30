#version 300 es

precision highp float;

uniform vec3 u_color;
uniform sampler2D u_texture;

in vec2 v_textureCoords;

out vec4 color;

void main() {
    // color = vec4(u_color, 1);
    color = texture(u_texture, v_textureCoords);
}