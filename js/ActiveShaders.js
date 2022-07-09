import Light from "./Light/Light.js";
import CircShader from "./Shader/CircShader.js";
import CircleGrid from "./CircleGrid/CircleGrid.js";
import CirclesChain from "./CirclesChain/CirclesChain.js";

new Light({
  light: {
    fShader: "shaders/light/light.frag",
    vShader: "shaders/light/light.vert",
  },
});

// new CircShader({
//   circ: {
//     vShader: "shaders/circ/circ.vert",
//     fShader: "shaders/circ/circ.frag",
//   },
// });

// new CircleGrid({
//   circle: {
//     vShader: "shaders/circle-grid/circle.vert",
//     fShader: "shaders/circle-grid/circle.frag",
//   },
// });

// new CirclesChain({
//   circle: {
//     vShader: "shaders/circles-chain/circle.vert",
//     fShader: "shaders/circles-chain/circle.frag",
//   },
// });
