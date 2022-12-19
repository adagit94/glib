#version 300 es

precision highp float;
precision highp samplerCubeShadow;

uniform vec4 u_color;
uniform vec3 u_lightPosition;
uniform samplerCube u_alphaMap;
in vec3 v_surfacePos;
out vec4 color;

float getClosestAlpha() {
    float stepFactor = 0.000001;

    for (float distanceFromLight = distance(u_lightPosition, v_surfacePos); distanceFromLight >= 0.01;) {
        vec3 texLookupCoords = v_surfacePos * stepFactor;
        float closestAlpha = texture(u_alphaMap, texLookupCoords).a;

        if (closestAlpha > 0.) {
            return closestAlpha;
        }

        
        distanceFromLight = distance(u_lightPosition, texLookupCoords);
    }

    return 0.;
}

void main() {
    float closestAlpha = getClosestAlpha();
    
    color = vec4(0, 0, 0, min(max(color.a, 0.) + closestAlpha, 1.));
}
