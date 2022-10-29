import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        super(ctx, { ...depthMapConf, cubeMap: false }, initialUniforms);
    }

    prepareLight = () => {
        const { depthMap, uniforms } = this;
        const { position, direction } = this.settings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
    };

    renderModelsToDepthMap = (models, setDepthMap) => {
        const { depthMap } = this;

        for (const model of models) {
            const mats = Array.isArray(model.mats) ? model.mats : [model.mats];

            for (const mat of mats) {
                depthMap.uniforms.finalLightMat = MatUtils.multMats3d(depthMap.light.viewMat, mat);

                setDepthMap(this);
                model.render();
            }
        }
    };

    getMatUniforms(secondToModelMat, modelMat) {
        return Object.assign(super.getMatUniforms(secondToModelMat, modelMat), {
            finalLightMat: MatUtils.multMats3d(this.depthMap.light.viewMat, modelMat),
        });
    }
}

export default SpotLight;
