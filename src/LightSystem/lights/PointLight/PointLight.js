import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(ctx, initialUniforms, conf) {
        super(ctx, initialUniforms, { ...conf, cubeMap: true });
    }

    prepare = (settings) => {
        const { depthMap, alphaMap, uniforms } = this;
        const { position } = settings;
        const texMapping = alphaMap || depthMap

        uniforms.lightPosition = position;

        if (texMapping) {
            texMapping.viewMats = [];

            // x+
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
            );

            // x-
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
            );

            // y+
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
            );

            // y-
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
            );

            // z+
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
            );

            // z-
            texMapping.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
            );
        }
    };
}

export default PointLight;
