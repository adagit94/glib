import Light from "../Light.js";

class DiffuseLight extends Light {
    constructor(gl, conf) {
        super(gl, conf);
    }

    async init() {
        await super.init({
            vShader: "js/Lights/DiffuseLight/diffuseLight.vert",
            fShader: "js/Lights/DiffuseLight/diffuseLight.frag",
        });
    }
}

export default DiffuseLight;
