import Light from "./Light/Light.js";

new Light({
  light: {
    fShader: "shaders/light/light.frag",
    vShader: "shaders/light/light.vert",
  },
});
