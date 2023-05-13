class VecUtils {
    static dot = (vecA, vecB) => vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];

    static cross = (vecA, vecB) => [
        vecA[1] * vecB[2] - vecA[2] * vecB[1],
        vecA[2] * vecB[0] - vecA[0] * vecB[2],
        vecA[0] * vecB[1] - vecA[1] * vecB[0],
    ];

    static subtract = (vecA, vecB) => [vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]];

    static add = (vecA, vecB) => [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]];

    static scale = (vec, factor) => [vec[0] * factor, vec[1] * factor, vec[2] * factor];

    static normalize = vec => {
        const length = VecUtils.length(vec);

        if (length === 0) return [0, 0, 0];
        return [vec[0] / length, vec[1] / length, vec[2] / length];
    };

    static length = vec => Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));

    static distance = (pA, pB) => VecUtils.length(VecUtils.subtract(pA, pB));

    static compare = (vecA, vecB, floatingDigits = 2) => {
        if (vecA[0].toFixed(floatingDigits) !== vecB[0].toFixed(floatingDigits)) return false;
        if (vecA[1].toFixed(floatingDigits) !== vecB[1].toFixed(floatingDigits)) return false;
        if (vecA[2].toFixed(floatingDigits) !== vecB[2].toFixed(floatingDigits)) return false;

        return true;
    };
}

export default VecUtils;
