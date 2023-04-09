import VecUtils from "../../utils/VecUtils.js";
import Magnet from "./Magnet.js";

class SphericMagnet extends Magnet {
    constructor(conf) {
        super(conf);

        this.r = conf.r;
    }

    r;

    eval = (frameDelta, position, vecToNextPosition, effectMat, shape) => {
        const { position: magnetPosition, r } = this;

        const vecToCenter = VecUtils.subtract(magnetPosition, position);
        const distanceToCenter = VecUtils.length(vecToCenter);
        const inZone = distanceToCenter <= r;

        if (inZone) {
            super.setDelta(frameDelta, distanceToCenter);
            super.setMagneticOffset(vecToCenter, vecToNextPosition, effectMat, shape);
        }
    }
}

export default SphericMagnet;
