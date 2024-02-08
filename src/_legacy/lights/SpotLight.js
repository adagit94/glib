import MatUtils from "../../../utils/MatUtils.js";
import VecUtils from "../../../utils/VecUtils.js";
import Light from "./Light.js";

class SpotLight extends Light {
    constructor(conf, initialUniforms) {
        super(conf, initialUniforms);

        this.setView(conf);
    }

    get type() {
        return "spot";
    }

    setView = conf => {
        const { position, target } = conf;

        this.setUniforms({ position, direction: VecUtils.subtract(target, position) });
        this.projection.mats.view = MatUtils.mult3d(this.projection.mats.proj, MatUtils.view3d(position, target));
    };
}

export default SpotLight;
