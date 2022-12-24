#version 300 es
#define texturesCount 32

precision highp float;
precision highp samplerCube;

uniform vec3 u_lightPosition;
uniform samplerCube u_alphaMaps[texturesCount];
uniform int u_closestAlphaMapIndex;
in vec3 v_surfacePos;
out vec4 color;

float getClosestAlpha() {
    vec3 lightToSurface = v_surfacePos - u_lightPosition;
    float closestAlpha;

    for(int alphaMapI = u_closestAlphaMapIndex; alphaMapI >= 0; alphaMapI--) {
        switch(alphaMapI) {
            case 0:
                closestAlpha = texture(u_alphaMaps[0], lightToSurface).a;
                break;
            case 1:
                closestAlpha = texture(u_alphaMaps[1], lightToSurface).a;
                break;
            case 2:
                closestAlpha = texture(u_alphaMaps[2], lightToSurface).a;
                break;
            case 3:
                closestAlpha = texture(u_alphaMaps[3], lightToSurface).a;
                break;
            case 4:
                closestAlpha = texture(u_alphaMaps[4], lightToSurface).a;
                break;
            case 5:
                closestAlpha = texture(u_alphaMaps[5], lightToSurface).a;
                break;
            case 6:
                closestAlpha = texture(u_alphaMaps[6], lightToSurface).a;
                break;
            case 7:
                closestAlpha = texture(u_alphaMaps[7], lightToSurface).a;
                break;
            case 8:
                closestAlpha = texture(u_alphaMaps[8], lightToSurface).a;
                break;
            case 9:
                closestAlpha = texture(u_alphaMaps[9], lightToSurface).a;
                break;
            case 10:
                closestAlpha = texture(u_alphaMaps[10], lightToSurface).a;
                break;
            case 11:
                closestAlpha = texture(u_alphaMaps[11], lightToSurface).a;
                break;
            case 12:
                closestAlpha = texture(u_alphaMaps[12], lightToSurface).a;
                break;
            case 13:
                closestAlpha = texture(u_alphaMaps[13], lightToSurface).a;
                break;
            case 14:
                closestAlpha = texture(u_alphaMaps[14], lightToSurface).a;
                break;
            case 15:
                closestAlpha = texture(u_alphaMaps[15], lightToSurface).a;
                break;
            case 16:
                closestAlpha = texture(u_alphaMaps[16], lightToSurface).a;
                break;
            case 17:
                closestAlpha = texture(u_alphaMaps[17], lightToSurface).a;
                break;
            case 18:
                closestAlpha = texture(u_alphaMaps[18], lightToSurface).a;
                break;
            case 19:
                closestAlpha = texture(u_alphaMaps[19], lightToSurface).a;
                break;
            case 20:
                closestAlpha = texture(u_alphaMaps[20], lightToSurface).a;
                break;
            case 21:
                closestAlpha = texture(u_alphaMaps[21], lightToSurface).a;
                break;
            case 22:
                closestAlpha = texture(u_alphaMaps[22], lightToSurface).a;
                break;
            case 23:
                closestAlpha = texture(u_alphaMaps[23], lightToSurface).a;
                break;
            case 24:
                closestAlpha = texture(u_alphaMaps[24], lightToSurface).a;
                break;
            case 25:
                closestAlpha = texture(u_alphaMaps[25], lightToSurface).a;
                break;
            case 26:
                closestAlpha = texture(u_alphaMaps[26], lightToSurface).a;
                break;
            case 27:
                closestAlpha = texture(u_alphaMaps[27], lightToSurface).a;
                break;
            case 28:
                closestAlpha = texture(u_alphaMaps[28], lightToSurface).a;
                break;
            case 29:
                closestAlpha = texture(u_alphaMaps[29], lightToSurface).a;
                break;
            case 30:
                closestAlpha = texture(u_alphaMaps[30], lightToSurface).a;
                break;
            case 31:
                closestAlpha = texture(u_alphaMaps[31], lightToSurface).a;
                break;
        }

        if(closestAlpha > 0.) {
            break;
        }
    }

    return closestAlpha;
}

void main() {
    float lightDiminution = getClosestAlpha();

    color = vec4(0, 0, 0, clamp(color.a + lightDiminution, 0., 1.));
}
