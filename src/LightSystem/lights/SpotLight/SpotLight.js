import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, initialUniforms, depthMapConf) {
        super(ctx, initialUniforms, depthMapConf && { ...depthMapConf, cubeMap: false });
    }

    prepare = (settings) => {
        const { depthMap, uniforms } = this;
        const { position, direction } = settings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        if (depthMap) {
            depthMap.light.viewMat = MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
        }
    };
}

export default SpotLight;
