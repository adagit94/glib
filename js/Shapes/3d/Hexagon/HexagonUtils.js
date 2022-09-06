export default class HexagonUtils {
    static getHexagonalPlateData() {
        const squareSide = 0.25
        
        return {
            vertices: new Float32Array([
                -squareSide / 2, -squareSide, squareSide * 2, // 0
                -squareSide / 2, squareSide, squareSide * 2, // 1
                squareSide / 2, squareSide, squareSide * 2, // 2
                squareSide / 2, -squareSide, squareSide * 2, // 3
                -squareSide * 1.5, 0, squareSide * 2, // 4
                squareSide * 1.5, 0, squareSide * 2, // 5

                -squareSide / 2, squareSide * 3, 0, // 6
                squareSide / 2, squareSide * 3, 0,  // 7
                -squareSide * 1.5, squareSide * 2, squareSide, // 8
                squareSide * 1.5, squareSide * 2, squareSide, // 9

                -squareSide / 2, squareSide, -squareSide * 2, // 10
                squareSide / 2, squareSide, -squareSide * 2,  // 11
                -squareSide * 1.5, squareSide * 2, -squareSide, // 12
                squareSide * 1.5, squareSide * 2, -squareSide, // 13

                -squareSide / 2, -squareSide, -squareSide * 2, // 14
                squareSide / 2, -squareSide, -squareSide * 2, // 15
                -squareSide * 1.5, 0, -squareSide * 2, // 16
                squareSide * 1.5, 0, -squareSide * 2, // 17

                -squareSide / 2, -squareSide * 3, 0, // 18
                squareSide / 2, -squareSide * 3, 0,  // 19
                -squareSide * 1.5, -squareSide * 2, -squareSide, // 20
                squareSide * 1.5, -squareSide * 2, -squareSide, // 21

                -squareSide * 1.5, -squareSide * 2, squareSide, // 22
                squareSide * 1.5, -squareSide * 2, squareSide, // 23
            ]),
            indices: new Uint16Array([
                0, 1, 3,
                2, 3, 1,
                0, 4, 1,
                3, 5, 2,

                1, 6, 2,
                7, 2, 6,
                1, 8, 6,
                7, 9, 2,

                6, 10, 7,
                11, 7, 10,
                6, 12, 10,
                11, 7, 13,

                10, 14, 15,
                15, 11, 10,
                10, 16, 14,
                11, 17, 15,

                14, 18, 15,
                15, 19, 18,
                14, 20, 18,
                15, 21, 19,

                0, 18, 19,
                0, 3, 19,
                0, 22, 18,
                3, 23, 19
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