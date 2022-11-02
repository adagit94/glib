export default class HexagonUtils {
    static getHexagonData(squareSide) {
        return {
            vertices: [
                // bottom
                -squareSide / 2, -2 * squareSide, squareSide, // 0
                -squareSide / 2, -2 * squareSide, -squareSide, // 1
                squareSide / 2, -2 * squareSide, -squareSide, // 2
                squareSide / 2, -2 * squareSide, squareSide, // 3
                -squareSide * 1.5, -2 * squareSide, 0, // 4
                squareSide * 1.5, -2 * squareSide, 0, // 5

                // bottom back middle
                -squareSide / 2, -2 * squareSide, -squareSide, // 6
                -squareSide / 2, 0, -squareSide * 3, // 7
                squareSide / 2, 0, -squareSide * 3, // 8
                squareSide / 2, -2 * squareSide, -squareSide, // 9
                -squareSide * 1.5, -squareSide, -squareSide * 2, // 10
                squareSide * 1.5, -squareSide, -squareSide * 2, // 11

                // bottom back right
                squareSide / 2, -2 * squareSide, -squareSide, // 12
                squareSide * 2.5, 0, -squareSide, // 13
                squareSide * 2.5, 0, 0, // 14
                squareSide * 1.5, -2 * squareSide, 0, // 15
                squareSide * 1.5, -squareSide, -squareSide * 2, // 16
                squareSide * 1.5, -squareSide, squareSide, // 17
            ],
            indices: [
                // bottom
                0, 1, 2,
                2, 3, 0,
                0, 4, 1,
                3, 5, 2,

                // bottom back middle
                6, 7, 8,
                8, 9, 6,
                6, 10, 7,
                9, 11, 8,

                // bottom back right
                12, 13, 14,
                14, 15, 12,
                12, 16, 13,
                14, 17, 15,
            ],
            normals: [
                // bottom
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,

                // bottom back middle
                0, -1, -1,
                0, -1, -1,
                0, -1, -1,
                0, -1, -1,
                0, -1, -1,
                0, -1, -1,

                // bottom back right
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,
            ]
        }
    }
}