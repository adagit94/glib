import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(ctx, name, depthMapConf, initialUniforms) {
        super(ctx, "spot", name, { ...depthMapConf, cubeMap: false }, initialUniforms);

        Object.assign(this.program.locations, {
            finalLightMat: this.gl.getUniformLocation(this.program.program, "u_finalLightMat"),
            lightDirection: this.gl.getUniformLocation(this.program.program, "u_lightDirection"),
            innerLimit: this.gl.getUniformLocation(this.program.program, "u_innerLimit"),
            outerLimit: this.gl.getUniformLocation(this.program.program, "u_outerLimit"),
        });
    }

    setUniforms() {
        super.setUniforms();

        this.gl.uniformMatrix4fv(this.program.locations.finalLightMat, false, this.program.uniforms.finalLightMat);
        this.gl.uniform3f(this.program.locations.lightDirection, ...this.program.uniforms.lightDirection);
        this.gl.uniform1f(this.program.locations.innerLimit, this.program.uniforms.innerLimit);
        this.gl.uniform1f(this.program.locations.outerLimit, this.program.uniforms.outerLimit);
    }

    lightForDepthMap = (viewSettings) => {
        const { depthMap, uniforms } = this.program;
        const { position, direction } = viewSettings;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
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
