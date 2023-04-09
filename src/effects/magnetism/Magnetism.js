import MatUtils from "../../utils/MatUtils.js";
import VecUtils from "../../utils/VecUtils.js";

class Magnetism {
    constructor(shape) {
        this.#shape = shape;
    }

    #shape;
    active = false;
    polarity = -1;
    inZone = false;

    evalMagnets = (frameDelta, magnets) => {
        this.#shape.perVertexOps ? this.#evalMagnetsPerVertex(frameDelta, magnets) : this.#evalMagnetsPerShape(frameDelta, magnets);
    };

    #evalMagnets(frameDelta, position, vecToNextPosition, effectMat, magnets) {
        for (const magnet of magnets) {
            magnet.eval(frameDelta, position, vecToNextPosition, effectMat, this.#shape);
        }
    }

    #evalMagnetsPerShape = (frameDelta, magnets) => {
        let { mats, position } = this.#shape;
        if (!position) position = this.#shape.setPosition(mats.origin);

        const offsetVec = VecUtils.subtract(this.#shape.getPosition(MatUtils.mult3d(mats.origin, [mats.effect, mats.offset])), position);

        this.inZone = false;
        this.#evalMagnets(frameDelta, position, offsetVec, mats.effect, magnets);
        this.#shape.setUniforms({ modelMat: MatUtils.mult3d(mats.origin, [mats.effect, mats.orientation]) });
    };

    #evalMagnetsPerVertex = (frameDelta, magnets) => {
        const { mats, transposeVertices } = this.#shape;

        this.inZone = false;
        transposeVertices(vertex => {
            let mat = MatUtils.translated3d(0, 0, 0);
            const offsetVec = VecUtils.subtract(MatUtils.multVertWithMats3d(vertex, mats.offset), vertex);

            this.#evalMagnets(frameDelta, vertex, offsetVec, mat, magnets);

            return MatUtils.multVertWithMats3d(vertex, mat);
        });
    };
}

export default Magnetism;
