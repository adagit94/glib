import Light from "../Light.js";

class PointLight extends Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        super(ctx, { ...depthMapConf, cubeMap: true }, initialUniforms);
    }

    prepareLight = () => {
        const { depthMap, uniforms } = this;
        const { position } = this.settings;

        uniforms.lightPosition = position;
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
}

export default PointLight;
