import MatUtils from "../../utils/MatUtils.js";
import VecUtils from "../../utils/VecUtils.js";
import Pattern from "../Pattern.js";

export default class Similarity extends Pattern {
    constructor() {
        super();
    }

    eval(frameDelta, shape, shapes) {
        let vecToClosestSimilar = this.#getVecToClosestSimilar(shape, shapes);
        vecToClosestSimilar = vecToClosestSimilar ? VecUtils.scale(vecToClosestSimilar, frameDelta * shape.getDeltaFactor("behaviour")) : [0, 0, 0];

        const offset = {
            x: vecToClosestSimilar[0],
            y: vecToClosestSimilar[1],
            z: vecToClosestSimilar[2],
        };

        if (shape.effectsActive()) {
            MatUtils.translate3d(shape.mats.offset, offset);
        } else {
            shape.setUniforms({
                modelMat: MatUtils.mult3d(shape.getUniforms().modelMat, MatUtils.translated3d(offset.x, offset.y, offset.z)),
            });
        }
    }

    #getVecToClosestSimilar(shape, shapes) {
        let closestSimilar = { similarity: 0 };

        for (const s of shapes) {
            if (s === shape) continue;

            const sameShape = shape.constructor.name === s.constructor.name;
            const sameColor = this.#colorEvaluator(shape, s);
            let similarity = 0;

            if (sameShape) similarity += 2;
            if (sameColor) similarity += 1;

            if (similarity >= closestSimilar.similarity) {
                const vec = VecUtils.subtract(s.position, shape.position);
                const distance = VecUtils.length(vec);

                if (similarity > closestSimilar.similarity || distance < closestSimilar.distance) {
                    closestSimilar.vec = vec;
                    closestSimilar.distance = distance;
                    closestSimilar.similarity = similarity;
                }
            }
        }

        return closestSimilar.vec;
    }

    #colorEvaluator(shapeA, shapeB) {
        const aUniforms = shapeA.getUniforms();

        if (aUniforms.useBufferColor) return false;

        const bUniforms = shapeB.getUniforms();

        const aColor = aUniforms.color;
        const bColor = bUniforms.color;

        let ratios = [];

        for (let i = 0; i < 3; i++) {
            ratios.push(aColor[i] / bColor[i]);
        }

        const referenceRatio = ratios[0].toFixed(3);

        if (ratios.some(r => r.toFixed(3) !== referenceRatio)) return false;

        return true;
    }
}
