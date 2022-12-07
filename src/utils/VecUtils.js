class VecUtils {
    static dot = (vecA, vecB) => vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];

    static cross = (vecA, vecB) =>
        [vecA[1] * vecB[2] - vecA[2] * vecB[1], vecA[2] * vecB[0] - vecA[0] * vecB[2], vecA[0] * vecB[1] - vecA[1] * vecB[0]];

    static subtract = (vecA, vecB) => [vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]];

    static add = (vecA, vecB) => [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]];

    static normalize = (vec) => {
        const length = VecUtils.length(vec);

        return [vec[0] / length, vec[1] / length, vec[2] / length];
    };

    static length = (vec) => Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));

    static distance = (vecA, vecB) => VecUtils.length(VecUtils.subtract(vecA, vecB));
}

export default VecUtils