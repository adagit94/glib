import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(conf) {
        super(conf);
    }

    async init(conf, depthMapConf, initialUniforms) {
        await super.init("SpotLight", conf, { ...depthMapConf, cubeMap: false }, initialUniforms);

        this.program.locations.finalLightMat = this.gl.getUniformLocation(this.program.program, "u_finalLightMat");
    }

    setUniforms() {
        super.setUniforms();

        this.gl.uniformMatrix4fv(this.program.locations.finalLightMat, false, this.program.uniforms.finalLightMat);
    }

    lightForDepthMap = (position, target) => {
        const { depthMap, uniforms } = this.program;

        uniforms.lightPosition = position;
        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, target));
    };

    renderModelsToDepthMap = (models) => {
        const { depthMap } = this.program;

        for (const model of models) {
            depthMap.uniforms.finalLightMat = MatUtils.multMats3d(depthMap.light.viewMat, model.mat);

            this.setDepthMap();
            model.render();
        }
    };
}

export default SpotLight;
