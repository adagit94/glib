export default class HexagonUtils {
    static getHexagonalPlateData(settings) {
        const {squareSide} = settings
        const r = 0.5
        
        return {
            vertices: new Float32Array([
                -squareSide / 2, -squareSide, 0, // 0
                -squareSide / 2, squareSide, 0, // 1
                squareSide / 2, squareSide, 0, // 2
                squareSide / 2, -squareSide, 0, // 3
                -squareSide * 1.5, 0, 0, // 4
                squareSide * 1.5, 0, 0, // 5

                -squareSide / 2, squareSide, 0, // 6
                -squareSide / 2, squareSide * 2, squareSide, // 7
                squareSide / 2, squareSide * 2, squareSide,  // 8
                squareSide / 2, squareSide, 0, // 9
                -squareSide * 1.5, squareSide * 1.5, squareSide / 2, // 10
                squareSide * 1.5, squareSide * 1.5, squareSide / 2, // 11
            ]),
            indices: new Uint16Array([
                0, 1, 3,
                2, 3, 1,
                0, 4, 1,
                3, 5, 2,

                6, 7, 9,
                8, 9, 7,
                6, 10, 7,
                9, 11, 8
            ]),
            normals: new Float32Array([
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
            ])
        }
    }
}