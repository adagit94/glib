#version 300 es

precision highp float;

uniform vec3 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_projectedTexture;

in vec2 v_textureCoords;
in vec4 v_projectedTextureCoords;

out vec4 color;

void main() {
    vec3 projectedTextureCoords = v_projectedTextureCoords.xyz / v_projectedTextureCoords.w;
    bool inRange = projectedTextureCoords.x >= 0.0 &&
        projectedTextureCoords.x <= 1.0 &&
        projectedTextureCoords.y >= 0.0 &&
        projectedTextureCoords.y <= 1.0;

    float currentDepth = projectedTextureCoords.z;
    float projectedDepth = texture(u_projectedTexture, projectedTextureCoords.xy).r;
    float shadowOrLight = inRange && projectedDepth <= currentDepth ? 0.0 : 1.0;

    vec4 colorFromTexture = texture(u_texture, v_textureCoords);

    color = vec4(colorFromTexture.rgb * shadowOrLight, colorFromTexture.a);
}