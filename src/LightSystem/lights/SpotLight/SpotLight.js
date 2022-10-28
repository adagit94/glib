import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        super(ctx, { ...depthMapConf, cubeMap: false }, initialUniforms);
    }
}

export default SpotLight;
