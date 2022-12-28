import MatUtils from "../../utils/MatUtils.js";
import Light from "./Light.js";

class SpotLight extends Light {
    constructor(conf, initialUniforms) {
        super(conf, initialUniforms);

        this.setView(conf);
    }

    get type() {
        return "spot"
    }

    setView = (conf) => {
        const { position, direction } = conf;
        let newUniforms = {}

        if (position) newUniforms.position = position;
        if (direction) newUniforms.direction = direction;

        this.setUniforms(newUniforms)

        const uniforms = this.getUniforms()

        this.projection.mats.view = MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(uniforms.position, uniforms.direction));
    };
}

export default SpotLight;
