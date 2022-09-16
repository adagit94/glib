import Light from "../Light.js";

class SphericLight extends Light {
    constructor(gl, conf) {
        super(gl, conf);

        this.init({
            vShader: "js/Lights/SphericLight/sphericLight.vert",
            fShader: "js/Lights/SphericLight/sphericLight.frag",
        });
    }
}

export default SphericLight;
