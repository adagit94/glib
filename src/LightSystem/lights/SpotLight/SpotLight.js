import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        super(ctx, { ...depthMapConf, cubeMap: false }, initialUniforms);
    }

    prepare = (settings) => {
        const { depthMap, uniforms } = this;
        const { position, direction } = settings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
    };

    getMatUniforms(secondToModelMat, modelMat) {
        return Object.assign(super.getMatUniforms(secondToModelMat, modelMat), {
            finalLightMat: MatUtils.multMats3d(this.depthMap.light.viewMat, modelMat),
        });
    }
}

export default SpotLight;
