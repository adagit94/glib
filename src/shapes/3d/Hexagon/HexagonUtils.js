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
                squareSide * 2.5, 0, -squareSide * 1.5, // 13
                squareSide * 3.5, 0, -squareSide, // 14
                squareSide * 1.5, -2 * squareSide, 0, // 15
                squareSide * 1.5, -squareSide, -squareSide * 2, // 16
                squareSide * 2.5, -squareSide, 0, // 17

                // bottom front right
                squareSide * 1.5, -2 * squareSide, 0, // 18
                squareSide * 3.5, 0, squareSide, // 19
                squareSide * 2.5, 0, squareSide * 1.5, // 20
                squareSide / 2, -2 * squareSide, squareSide, // 21
                squareSide * 2.5, -squareSide, 0, // 22
                squareSide * 1.5, -squareSide, squareSide * 2, // 23

                // bottom front middle
                -squareSide / 2, -2 * squareSide, squareSide, // 24
                -squareSide / 2, 0, squareSide * 3, // 25
                squareSide / 2, 0, squareSide * 3, // 26
                squareSide / 2, -2 * squareSide, squareSide, // 27
                -squareSide * 1.5, -squareSide, squareSide * 2, // 28
                squareSide * 1.5, -squareSide, squareSide * 2, // 29

                // bottom front left
                -squareSide * 1.5, -2 * squareSide, 0, // 30
                -squareSide * 3.5, 0, squareSide, // 31
                -squareSide * 2.5, 0, squareSide * 1.5, // 32
                -squareSide / 2, -2 * squareSide, squareSide, // 33
                -squareSide * 2.5, -squareSide, 0, // 34
                -squareSide * 1.5, -squareSide, squareSide * 2, // 35

                // bottom back left
                -squareSide / 2, -2 * squareSide, -squareSide, // 36
                -squareSide * 2.5, 0, -squareSide * 1.5, // 37
                -squareSide * 3.5, 0, -squareSide, // 38
                -squareSide * 1.5, -2 * squareSide, 0, // 39
                -squareSide * 1.5, -squareSide, -squareSide * 2, // 40
                -squareSide * 2.5, -squareSide, 0, // 41
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

                // bottom front right
                18, 19, 20,
                20, 21, 18,
                18, 22, 19,
                21, 23, 20,

                // bottom front middle
                24, 25, 26,
                26, 27, 24,
                24, 28, 25,
                27, 29, 26,

                // bottom front left
                30, 31, 32,
                32, 33, 30,
                30, 34, 31,
                33, 35, 32,

                // bottom back left
                36, 37, 38,
                38, 39, 36,
                36, 40, 37,
                39, 41, 38,
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
                1, -1, -1,
                1, -1, -1,
                1, -1, -1,
                1, -1, -1,
                1, -1, -1,
                1, -1, -1,

                // bottom front right
                1, -1, 1,
                1, -1, 1,
                1, -1, 1,
                1, -1, 1,
                1, -1, 1,
                1, -1, 1,

                // bottom back middle
                0, -1, 1,
                0, -1, 1,
                0, -1, 1,
                0, -1, 1,
                0, -1, 1,
                0, -1, 1,

                // bottom front left
                -1, -1, 1,
                -1, -1, 1,
                -1, -1, 1,
                -1, -1, 1,
                -1, -1, 1,
                -1, -1, 1,

                // bottom back left
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
                -1, -1, -1,
            ]
        }
    }
}