class VecUtils {
    static dotProduct = (vecA, vecB) => vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];

    static crossProduct = (vecA, vecB) =>
        new Float32Array([vecA[1] * vecB[2] - vecB[1] * vecA[2], vecA[2] * vecB[0] - vecB[2] * vecA[0], vecA[0] * vecB[1] - vecB[0] * vecA[1]]);

    static subtractVecs = (vecA, vecB) => new Float32Array([vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]]);

    static addVecs = (vecA, vecB) => new Float32Array([vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]]);

    static normalizeVec = (vec) => {
        const length = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));

        return new Float32Array([vec[0] / length, vec[1] / length, vec[2] / length]);
    };
}

export default VecUtils