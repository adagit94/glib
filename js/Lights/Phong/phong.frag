#version 300 es

precision lowp int;
precision highp float;

uniform vec3 u_color;

uniform int u_ambientActive;
uniform vec3 u_ambientColor;

uniform int u_diffuseActive;
uniform vec3 u_diffusePosition;
uniform vec3 u_diffuseColor;

uniform int u_specularActive;
uniform vec3 u_specularPosition;
uniform vec3 u_specularColor;
uniform vec3 u_specularCameraPosition;
uniform float u_specularShininess;

in vec3 v_normal;
in vec3 v_surfacePos;

out vec4 color;

vec3 ambientLight = vec3(0);
vec3 diffuseLight = vec3(0); 
vec3 specularLight = vec3(0);
vec3 specularEffect = vec3(0);

void main() {
    vec3 normal = normalize(v_normal);

    if(u_ambientActive == 1) {
        ambientLight = u_ambientColor;
    }

    if(u_diffuseActive == 1) {
        vec3 surfaceToLight = normalize(u_diffusePosition - v_surfacePos);

        diffuseLight = max(dot(normal, surfaceToLight), 0.) * u_diffuseColor;
    }

    if(u_specularActive == 1) {
        vec3 surfaceToLight = normalize(u_specularPosition - v_surfacePos);

        float light = max(dot(normal, surfaceToLight), 0.);
        float specular = 0.0;

        if(light > 0.) {
            vec3 surfaceToCamera = normalize(u_specularCameraPosition - v_surfacePos);
            vec3 reflectedLightRay = reflect(-surfaceToLight, normal);

            specular = pow(max(dot(surfaceToCamera, reflectedLightRay), 0.), u_specularShininess);
        }

        specularLight = light * u_specularColor;
        specularEffect = specular * u_specularColor;
    }

    color = vec4(u_color, 1);

    color.rgb *= ambientLight + diffuseLight + specularLight;
    color.rgb += specularEffect;
}
