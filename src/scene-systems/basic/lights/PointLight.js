import MatUtils from "../../utils/MatUtils.js";
import Light from "./Light.js";

class PointLight extends Light {
    constructor(conf, initialUniforms) {
        super(conf, initialUniforms);

        this.setView(conf);
    }

    get type() {
        return "point";
    }

    setView = (conf) => {
        const { position } = conf;

        if (position) this.setUniforms({ position });

        const uniforms = this.getUniforms();

        this.projection.mats.view = [];

        // x+
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0] + 1, uniforms.position[1], uniforms.position[2]], [0, -1, 0]))
        );

        // x-
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0] - 1, uniforms.position[1], uniforms.position[2]], [0, -1, 0]))
        );

        // y+
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0], uniforms.position[1] + 1, uniforms.position[2]], [0, 0, 1]))
        );

        // y-
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0], uniforms.position[1] - 1, uniforms.position[2]], [0, 0, -1]))
        );

        // z+
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0], uniforms.position[1], uniforms.position[2] + 1], [0, -1, 0]))
        );

        // z-
        this.projection.mats.view.push(
            MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, [uniforms.position[0], uniforms.position[1], uniforms.position[2] - 1], [0, -1, 0]))
        );
    };
}

export default PointLight;
