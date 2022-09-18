#version 300 es

precision highp float;

uniform vec3 u_color;
uniform vec3 u_lightColor;
uniform float u_shininess;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToCamera;

out vec4 color;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToCamera = normalize(v_surfaceToCamera);
    vec3 halfVector = normalize(surfaceToLight + surfaceToCamera);

    float light = dot(normal, surfaceToLight);
    float specular = 0.0;

    if(light > 0.) {
        specular = pow(dot(normal, halfVector), u_shininess);
    }

    color = vec4(u_color, 1);

    color.rgb *= light * u_lightColor;
    color.rgb += specular * u_lightColor;
}
