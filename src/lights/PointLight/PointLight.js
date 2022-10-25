import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(ctx, name, depthMapConf, initialUniforms) {
        super(ctx, "point", name, { ...depthMapConf, cubeMap: true }, initialUniforms);

        Object.assign(this.depthMap.locations, {
            modelMat: this.gl.getUniformLocation(this.depthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(this.depthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(this.depthMap.program, "u_far"),
        });

        Object.assign(this.locations, {
            far: this.gl.getUniformLocation(this.program, "u_far"),
        });
    }

    lightForDepthMap = (position) => {
        const { depthMap, uniforms } = this;

        uniforms.lightPosition = depthMap.uniforms.lightPosition = position;
        depthMap.light.viewMats = [];

        // x+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
        );

        // x-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
        );

        // y+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
        );

        // y-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
        );

        // z+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
        );

        // z-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
        );
    };

    renderModelsToDepthMap = (models) => {
        const { depthMap } = this;

        for (let side = 0; side < 6; side++) {
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                depthMap.texture.texture,
                0
            );

            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            const lightMat = depthMap.light.viewMats[side];

            for (const model of models) {
                depthMap.uniforms.finalLightMat = MatUtils.multMats3d(lightMat, model.mat);
                depthMap.uniforms.modelMat = model.mat;

                this.setDepthMap();
                model.render();
            }
        }
    };

    setUniforms() {
        super.setUniforms();

        this.gl.uniform1f(this.locations.far, this.uniforms.far);
    }

    setDepthMapUniforms() {
        super.setDepthMapUniforms();

        this.gl.uniformMatrix4fv(this.depthMap.locations.modelMat, false, this.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.depthMap.locations.lightPosition, ...this.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.depthMap.locations.far, this.depthMap.uniforms.far);
    }
}

export default PointLight;
