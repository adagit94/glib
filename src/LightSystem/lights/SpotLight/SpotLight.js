import MatUtils from "../../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(conf, initialUniforms) {
        super(conf, initialUniforms);

        this.prepare(conf)
    }

    prepare = (conf) => {
        const { uniforms } = this;
        const { position, direction } = conf;

        if (position) uniforms.lightPosition = position;
        if (direction) uniforms.lightDirection = direction;

        if (this.projectionMat) {
            this.viewMat = MatUtils.mult3d(this.projectionMat, MatUtils.view3d(uniforms.lightPosition, uniforms.lightDirection));
        }
    };

    viewMat
}

export default SpotLight;
