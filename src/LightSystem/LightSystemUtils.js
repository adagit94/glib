import MatUtils from "../utils/MatUtils.js";
import VecUtils from "../utils/VecUtils.js";

class LightSystemUtils {
    static prepareLightIntensityMapUniforms(light, uniformsSet, lightMat) {
        light.uniforms.color = uniformsSet.color;
        light.uniforms.lightIntensityMap.modelMat = uniformsSet.mats.model;
        light.uniforms.lightIntensityMap.finalLightMat = MatUtils.mult3d(lightMat, uniformsSet.mats.model);
    }

    static prepareSpotDepthMapUniforms(light, uniformsSet, lightMat) {
        light.uniforms.depthMap.finalLightMat = MatUtils.mult3d(lightMat, uniformsSet.mats.model);
    }

    static preparePointDepthMapUniforms(light, uniformsSet, lightMat) {
        light.uniforms.depthMap.modelMat = uniformsSet.mats.model;
        light.uniforms.depthMap.finalLightMat = MatUtils.mult3d(lightMat, uniformsSet.mats.model);
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

    static sortModels(sourceData, order) {
        let { models, origin } = sourceData;

        models.sort((firstModel, secondModel) => {
            const firstModelPos = firstModel.mats.final.slice(12, firstModel.mats.length - 1);
            const firstModelDistanceFromLight = VecUtils.distance(firstModelPos, origin);
            const secondModelPos = secondModel.mats.final.slice(12, secondModel.mats.length - 1);
            const secondModelDistanceFromLight = VecUtils.distance(secondModelPos, origin);

            switch (order) {
                case "fromLight":
                    return firstModelDistanceFromLight - secondModelDistanceFromLight;

                case "fromCamera":
                    return secondModelDistanceFromLight - firstModelDistanceFromLight;
            }
        });
    }
}

export default LightSystemUtils;
