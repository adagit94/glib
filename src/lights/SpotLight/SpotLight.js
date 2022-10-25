import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, name, depthMapConf, initialUniforms) {
        super(ctx, "spot", name, { ...depthMapConf, cubeMap: false }, initialUniforms);

        Object.assign(this.locations, {
            finalLightMat: this.gl.getUniformLocation(this.program, "u_finalLightMat"),
            lightDirection: this.gl.getUniformLocation(this.program, "u_lightDirection"),
            innerLimit: this.gl.getUniformLocation(this.program, "u_innerLimit"),
            outerLimit: this.gl.getUniformLocation(this.program, "u_outerLimit"),
        });
    }

    setUniforms() {
        super.setUniforms();

        this.gl.uniformMatrix4fv(this.locations.finalLightMat, false, this.uniforms.finalLightMat);
        this.gl.uniform3f(this.locations.lightDirection, ...this.uniforms.lightDirection);
        this.gl.uniform1f(this.locations.innerLimit, this.uniforms.innerLimit);
        this.gl.uniform1f(this.locations.outerLimit, this.uniforms.outerLimit);
    }

    lightForDepthMap = (viewSettings) => {
        const { depthMap, uniforms } = this;
        const { position, direction } = viewSettings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
    };

    renderModelsToDepthMap = (models) => {
        const { depthMap } = this;

        for (const model of models) {
            depthMap.uniforms.finalLightMat = MatUtils.multMats3d(depthMap.light.viewMat, model.mat);

            this.setDepthMap();
            model.render();
        }
    };
}

export default SpotLight;
