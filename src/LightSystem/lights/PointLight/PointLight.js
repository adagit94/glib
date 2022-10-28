import Light from "../Light.js";

class PointLight extends Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        super(ctx, { ...depthMapConf, cubeMap: true }, initialUniforms);
    }
}

export default PointLight;
