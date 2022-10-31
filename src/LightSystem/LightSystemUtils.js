import MatUtils from "../utils/MatUtils.js";

class LightSystemUtils {
    static prepareSpotDepthMapUniforms(light, uniformsSet, lightMat) {
        LightSystemUtils.#prepareCommonDepthMapUniforms(light, uniformsSet, lightMat);
    }

    static preparePointDepthMapUniforms(light, uniformsSet, lightMat) {
        LightSystemUtils.#prepareCommonDepthMapUniforms(light, uniformsSet, lightMat);
        light.depthMap.uniforms.modelMat = uniformsSet.mats.model;
    }

    static #prepareCommonDepthMapUniforms(light, uniformsSet, lightMat) {
        light.depthMap.uniforms.finalLightMat = MatUtils.mult3d(lightMat, uniformsSet.mats.model);
    }

    static prepareSpotUniforms(light, uniformsSet) {
        LightSystemUtils.#prepareCommonUniforms(light, uniformsSet);
        light.uniforms.finalLightMat = MatUtils.mult3d(light.depthMap.light.viewMat, uniformsSet.mats.model);
    }

    static preparePointUniforms(light, uniformsSet) {
        LightSystemUtils.#prepareCommonUniforms(light, uniformsSet);
    }

    static #prepareCommonUniforms(light, uniformsSet) {
        light.uniforms.color = uniformsSet.color;
        light.uniforms.finalMat = uniformsSet.mats.final;
        light.uniforms.modelMat = uniformsSet.mats.model;
        light.uniforms.normalMat = MatUtils.normal3d(uniformsSet.mats.model);
    }
}

export default LightSystemUtils;
