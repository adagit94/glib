import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, initialUniforms, conf) {
        super(ctx, initialUniforms, { ...conf, cubeMap: false });
    }

    prepare = (settings) => {
        const { depthMap, alphaMap, uniforms } = this;
        const { position, direction } = settings;
        const texMapping = alphaMap || depthMap

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        if (texMapping) {
            texMapping.viewMat = MatUtils.mult3d(this.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
        }
    };
}

export default SpotLight;
