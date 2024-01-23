import MatUtils from "../../utils/MatUtils.js";
import VecUtils from "../../utils/VecUtils.js";

class Magnet {
    constructor(conf) {
        this.polarity = conf.polarity ?? -1;
        this.position = conf.position ?? [0, 0, 0];
        this.#exp = conf.exp ?? 1;
    }

    active = true;
    polarity;
    position;
    #delta;
    #exp;

    setDelta(frameDelta, distance) {
        this.#delta = Math.pow(1 / Math.max(distance, 1), this.#exp + frameDelta);
    }

    setMagneticOffset(vecToMagnet, vecToNextPosition, effectMat, shape) {
        let magneticEffect = shape.getEffect("magnetism");
        const vecPolarity = this.polarity === magneticEffect.polarity ? -1 : 1;
        
        vecToMagnet = VecUtils.scale(vecToMagnet, this.#delta * vecPolarity);
        vecToMagnet = VecUtils.add(vecToNextPosition, vecToMagnet);

        MatUtils.translate3d(effectMat, {
            x: vecToMagnet[0],
            y: vecToMagnet[1],
            z: vecToMagnet[2],
        });

        magneticEffect.inZone = true;
    }
}

export default Magnet;
