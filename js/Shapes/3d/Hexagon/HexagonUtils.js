export default class HexagonUtils {
    static getHexagonalPlateData() {
        const squareSide = 0.25
        
        return {
            vertices: new Float32Array([
                -squareSide / 2, -squareSide, squareSide * 3, // 0
                -squareSide / 2, squareSide, squareSide * 3, // 1
                squareSide / 2, squareSide, squareSide * 3, // 2
                squareSide / 2, -squareSide, squareSide * 3, // 3
                -squareSide * 1.5, 0, squareSide * 3, // 4
                squareSide * 1.5, 0, squareSide * 3, // 5

                -squareSide / 2, squareSide * 3, squareSide, // 6
                squareSide / 2, squareSide * 3, squareSide,  // 7
                -squareSide * 1.5, squareSide * 2, squareSide * 2, // 8
                squareSide * 1.5, squareSide * 2, squareSide * 2, // 9

                -squareSide / 2, squareSide * 3, -squareSide, // 10
                squareSide / 2, squareSide * 3, -squareSide,  // 11
                -squareSide * 1.5, squareSide * 3, 0, // 12
                squareSide * 1.5, squareSide * 3, 0, // 13

                -squareSide / 2, squareSide, -squareSide * 3, // 14
                squareSide / 2, squareSide, -squareSide * 3,  // 15
                -squareSide * 1.5, squareSide * 2, -squareSide * 2, // 16
                squareSide * 1.5, squareSide * 2, -squareSide * 2, // 17

                -squareSide / 2, -squareSide, -squareSide * 3, // 18
                squareSide / 2, -squareSide, -squareSide * 3, // 19
                -squareSide * 1.5, 0, -squareSide * 3, // 20
                squareSide * 1.5, 0, -squareSide * 3, // 21

                -squareSide / 2, -squareSide * 3, -squareSide, // 22
                squareSide / 2, -squareSide * 3, -squareSide,  // 23
                -squareSide * 1.5, -squareSide * 2, -squareSide * 2, // 24
                squareSide * 1.5, -squareSide * 2, -squareSide * 2, // 25

                -squareSide / 2, -squareSide * 3, squareSide, // 26
                squareSide / 2, -squareSide * 3, squareSide,  // 27
                -squareSide * 1.5, -squareSide * 3, 0, // 28
                squareSide * 1.5, -squareSide * 3, 0, // 29

                -squareSide * 1.5, -squareSide * 2, squareSide * 2, // 30
                squareSide * 1.5, -squareSide * 2, squareSide * 2, // 31
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

                18, 22, 19,
                19, 23, 22,
                18, 24, 22,
                19, 25, 23,

                22, 26, 23,
                23, 27, 26,
                22, 28, 26,
                23, 29, 27,

                0, 26, 3,
                26, 27, 3,
                0, 30, 26,
                3, 31, 27,
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