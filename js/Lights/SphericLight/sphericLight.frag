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
    vec3 surfaceToView = normalize(v_surfaceToCamera);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);

    float light = dot(normal, surfaceToLight);
    float specular = pow(dot(normal, halfVector), u_shininess);

    color = vec4(u_color, 1);

    color.rgb *= light;
    color.rgb *= u_lightColor;

    if(color.r > 0.) {
        color.r += specular;
    }

    if(color.g > 0.) {
        color.g += specular;
    }

    if(color.b > 0.) {
        color.b += specular;
    }
}
