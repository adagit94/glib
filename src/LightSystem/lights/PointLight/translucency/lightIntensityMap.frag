#version 300 es
#define texturesCount 16

precision highp float;
precision highp samplerCube;

uniform vec4 u_color;
uniform vec3 u_lightPosition;
uniform samplerCube u_lightIntensityMaps[texturesCount];
uniform int u_closestLightIntensityMapIndex;
in vec3 v_surfacePos;
out vec4 color;

float getClosestDiminution() {
    vec3 lightToSurface = v_surfacePos - u_lightPosition;
    float closestSample = 0.;

    for(int mapI = u_closestLightIntensityMapIndex; mapI >= 0; mapI--) {
        switch(mapI) {
            case 0:
                closestSample = texture(u_lightIntensityMaps[0], lightToSurface).a;
                break;
            case 1:
                closestSample = texture(u_lightIntensityMaps[1], lightToSurface).a;
                break;
            case 2:
                closestSample = texture(u_lightIntensityMaps[2], lightToSurface).a;
                break;
            case 3:
                closestSample = texture(u_lightIntensityMaps[3], lightToSurface).a;
                break;
            case 4:
                closestSample = texture(u_lightIntensityMaps[4], lightToSurface).a;
                break;
            case 5:
                closestSample = texture(u_lightIntensityMaps[5], lightToSurface).a;
                break;
            case 6:
                closestSample = texture(u_lightIntensityMaps[6], lightToSurface).a;
                break;
            case 7:
                closestSample = texture(u_lightIntensityMaps[7], lightToSurface).a;
                break;
            case 8:
                closestSample = texture(u_lightIntensityMaps[8], lightToSurface).a;
                break;
            case 9:
                closestSample = texture(u_lightIntensityMaps[9], lightToSurface).a;
                break;
            case 10:
                closestSample = texture(u_lightIntensityMaps[10], lightToSurface).a;
                break;
            case 11:
                closestSample = texture(u_lightIntensityMaps[11], lightToSurface).a;
                break;
            case 12:
                closestSample = texture(u_lightIntensityMaps[12], lightToSurface).a;
                break;
            case 13:
                closestSample = texture(u_lightIntensityMaps[13], lightToSurface).a;
                break;
            case 14:
                closestSample = texture(u_lightIntensityMaps[14], lightToSurface).a;
                break;
            case 15:
                closestSample = texture(u_lightIntensityMaps[15], lightToSurface).a;
                break;
        }

        if(closestSample > 0.) {
            break;
        }
    }

    return closestSample;
}

void main() {
    float lightDiminution = getClosestDiminution();

    color = vec4(1. - lightDiminution, 0, 0, clamp(u_color.a + lightDiminution, 0., 1.));
}
