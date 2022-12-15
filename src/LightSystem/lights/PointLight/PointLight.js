import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(ctx, initialUniforms, depthMapConf) {
        super(ctx, initialUniforms, depthMapConf && { ...depthMapConf, cubeMap: true });
    }

    prepare = (settings) => {
        const { depthMap, uniforms } = this;
        const { position } = settings;

        uniforms.lightPosition = position;
        
        if (depthMap) {
            depthMap.light.viewMats = [];

            // x+
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
            );

            // x-
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
            );

            // y+
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
            );

            // y-
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
            );

            // z+
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
            );

            // z-
            depthMap.light.viewMats.push(
                MatUtils.mult3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
            );
        }
    };
}

export default PointLight;
