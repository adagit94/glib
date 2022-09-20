#version 300 es

precision highp float;

uniform vec3 u_color;
uniform vec3 u_ambientColor;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform float u_shininess;

in vec3 v_normal;
in vec3 v_surfacePos;

out vec4 color;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(u_lightPosition - v_surfacePos);

    float diffuseLight = max(dot(normal, surfaceToLight), 0.);
    vec3 diffuseColor = diffuseLight * u_lightColor;
    vec3 specular = vec3(0);
    
    if(diffuseLight > 0.) {
        vec3 surfaceToCamera = normalize(u_cameraPosition - v_surfacePos);
        vec3 reflectedLightRay = reflect(-surfaceToLight, normal);

        specular = pow(max(dot(surfaceToCamera, reflectedLightRay), 0.), u_shininess) * u_lightColor;
    }

    color = vec4(u_color, 1);
    color.rgb *= u_ambientColor + diffuseColor;
    color.rgb += specular;
}
