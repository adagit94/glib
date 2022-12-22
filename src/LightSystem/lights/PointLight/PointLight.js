import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(conf, initialUniforms) {
        super(conf, initialUniforms);

        this.prepare(conf)
    }

    prepare = (conf) => {
        const { uniforms } = this;
        const { position } = conf;

        uniforms.lightPosition = position;

        if (this.projectionMat) {
            this.viewMats = [];

            // x+
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
            );

            // x-
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
            );

            // y+
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
            );

            // y-
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
            );

            // z+
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
            );

            // z-
            this.viewMats.push(
                MatUtils.mult3d(this.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
            );
        }
    };

    viewMats
}

export default PointLight;
