import Light from "../Light.js";

class SpecularLight extends Light {
    constructor(gl, conf) {
        super(gl, conf);
    }

    async init() {
        await super.init({
            vShader: "js/Lights/SpecularLight/specularLight.vert",
            fShader: "js/Lights/SpecularLight/specularLight.frag",
        });
    }
}

export default SpecularLight;
