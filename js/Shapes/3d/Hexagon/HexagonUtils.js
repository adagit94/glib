export default class HexagonUtils {
    static getHexagonalPlateData() {
        const squareSide = 0.25
        
        return {
            vertices: new Float32Array([
                -squareSide / 2, -squareSide / 2, squareSide, // 0
                -squareSide / 2, squareSide / 2, squareSide, // 1
                squareSide / 2, squareSide / 2, squareSide, // 2
                squareSide / 2, -squareSide / 2, squareSide, // 3
                -squareSide * 1.5, 0, squareSide, // 4
                squareSide * 1.5, 0, squareSide, // 5

                -squareSide / 2, squareSide / 2, squareSide, // 6
                -squareSide / 2, squareSide * 1.5, 0, // 7
                squareSide / 2, squareSide * 1.5, 0,  // 8
                squareSide / 2, squareSide / 2, squareSide, // 9
                -squareSide * 1.5, squareSide, squareSide / 2, // 10
                squareSide * 1.5, squareSide, squareSide / 2, // 11

                -squareSide / 2, squareSide * 1.5, 0, // 12
                -squareSide / 2, squareSide / 2, -squareSide, // 13
                squareSide / 2, squareSide / 2, -squareSide,  // 14
                squareSide / 2, squareSide * 1.5, 0, // 15
                -squareSide * 1.5, squareSide, -squareSide / 2, // 16
                squareSide * 1.5, squareSide, -squareSide / 2, // 17

                -squareSide / 2, -squareSide / 2, -squareSide, // 18
                -squareSide / 2, squareSide / 2, -squareSide, // 19
                squareSide / 2, squareSide / 2, -squareSide, // 20
                squareSide / 2, -squareSide / 2, -squareSide, // 21
                -squareSide * 1.5, 0, -squareSide, // 22
                squareSide * 1.5, 0, -squareSide, // 23
            ]),
            indices: new Uint16Array([
                0, 1, 3,
                2, 3, 1,
                0, 4, 1,
                3, 5, 2,

                6, 7, 9,
                8, 9, 7,
                6, 10, 7,
                9, 11, 8,

                12, 13, 15,
                14, 15, 13,
                12, 16, 13,
                15, 17, 14,

                18, 19, 21,
                20, 21, 19,
                18, 22, 19,
                21, 23, 20,
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