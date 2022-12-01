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


                // top
                -squareSide / 2, 2 * squareSide, squareSide, // 42
                -squareSide / 2, 2 * squareSide, -squareSide, // 43
                squareSide / 2, 2 * squareSide, -squareSide, // 44
                squareSide / 2, 2 * squareSide, squareSide, // 45
                -squareSide * 1.5, 2 * squareSide, 0, // 46
                squareSide * 1.5, 2 * squareSide, 0, // 47

                // top back middle
                -squareSide / 2, 2 * squareSide, -squareSide, // 48
                -squareSide / 2, 0, -squareSide * 3, // 49
                squareSide / 2, 0, -squareSide * 3, // 50
                squareSide / 2, 2 * squareSide, -squareSide, // 51
                -squareSide * 1.5, squareSide, -squareSide * 2, // 52
                squareSide * 1.5, squareSide, -squareSide * 2, // 53

                // top back right
                squareSide / 2, 2 * squareSide, -squareSide, // 54
                squareSide * 2.5, 0, -squareSide * 1.5, // 55
                squareSide * 3.5, 0, -squareSide, // 56
                squareSide * 1.5, 2 * squareSide, 0, // 57
                squareSide * 1.5, squareSide, -squareSide * 2, // 58
                squareSide * 2.5, squareSide, 0, // 59

                // top front right
                squareSide * 1.5, 2 * squareSide, 0, // 60
                squareSide * 3.5, 0, squareSide, // 61
                squareSide * 2.5, 0, squareSide * 1.5, // 62
                squareSide / 2, 2 * squareSide, squareSide, // 63
                squareSide * 2.5, squareSide, 0, // 64
                squareSide * 1.5, squareSide, squareSide * 2, // 65

                // top front middle
                -squareSide / 2, 2 * squareSide, squareSide, // 66
                -squareSide / 2, 0, squareSide * 3, // 67
                squareSide / 2, 0, squareSide * 3, // 68
                squareSide / 2, 2 * squareSide, squareSide, // 69
                -squareSide * 1.5, squareSide, squareSide * 2, // 70
                squareSide * 1.5, squareSide, squareSide * 2, // 71

                // top front left
                -squareSide * 1.5, 2 * squareSide, 0, // 72
                -squareSide * 3.5, 0, squareSide, // 73
                -squareSide * 2.5, 0, squareSide * 1.5, // 74
                -squareSide / 2, 2 * squareSide, squareSide, // 75
                -squareSide * 2.5, squareSide, 0, // 76
                -squareSide * 1.5, squareSide, squareSide * 2, // 77

                // top back left
                -squareSide / 2, 2 * squareSide, -squareSide, // 78
                -squareSide * 2.5, 0, -squareSide * 1.5, // 79
                -squareSide * 3.5, 0, -squareSide, // 80
                -squareSide * 1.5, 2 * squareSide, 0, // 81
                -squareSide * 1.5, squareSide, -squareSide * 2, // 82
                -squareSide * 2.5, squareSide, 0, // 83


                // front right corner
                squareSide / 2, 0, squareSide * 3, // 84
                squareSide * 1.5, squareSide, squareSide * 2, // 85
                squareSide * 2.5, 0, squareSide * 1.5, // 86
                squareSide * 1.5, -squareSide, squareSide * 2, // 87

                // front left corner
                -squareSide / 2, 0, squareSide * 3, // 88
                -squareSide * 1.5, squareSide, squareSide * 2, // 89
                -squareSide * 2.5, 0, squareSide * 1.5, // 90
                -squareSide * 1.5, -squareSide, squareSide * 2, // 91

                // back left corner
                -squareSide / 2, 0, -squareSide * 3, // 92
                -squareSide * 1.5, squareSide, -squareSide * 2, // 93
                -squareSide * 2.5, 0, -squareSide * 1.5, // 94
                -squareSide * 1.5, -squareSide, -squareSide * 2, // 95

                // back right corner
                squareSide / 2, 0, -squareSide * 3, // 96
                squareSide * 1.5, squareSide, -squareSide * 2, // 97
                squareSide * 2.5, 0, -squareSide * 1.5, // 98
                squareSide * 1.5, -squareSide, -squareSide * 2, // 99

                // right corner
                squareSide * 3.5, 0, squareSide, // 100
                squareSide * 2.5, squareSide, 0, // 101
                squareSide * 3.5, 0, -squareSide, // 102
                squareSide * 2.5, -squareSide, 0, // 103

                // left corner
                -squareSide * 3.5, 0, squareSide, // 104
                -squareSide * 2.5, squareSide, 0, // 105
                -squareSide * 3.5, 0, -squareSide, // 106
                -squareSide * 2.5, -squareSide, 0, // 107
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


                // top
                42, 43, 44,
                44, 45, 42,
                42, 46, 43,
                45, 47, 44,

                // top back middle
                48, 49, 50,
                50, 51, 48,
                48, 52, 49,
                51, 53, 50,

                // top back right
                54, 55, 56,
                56, 57, 54,
                54, 58, 55,
                57, 59, 56,

                // top front right
                60, 61, 62,
                62, 63, 60,
                60, 64, 61,
                63, 65, 62,

                // top front middle
                66, 67, 68,
                68, 69, 66,
                66, 70, 67,
                69, 71, 68,

                // top front left
                72, 73, 74,
                74, 75, 72,
                72, 76, 73,
                75, 77, 74,

                // top back left
                78, 79, 80,
                80, 81, 78,
                78, 82, 79,
                81, 83, 80,


                // front right corner
                84, 85, 86,
                86, 87, 84,
                
                // front left corner
                88, 89, 90,
                90, 91, 88,

                // back left corner
                92, 93, 94,
                94, 95, 92,

                // back right corner
                96, 97, 98,
                98, 99, 96,

                // right corner
                100, 101, 102,
                102, 103, 100,

                // left corner
                104, 105, 106,
                106, 107, 104,
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

                
                // top
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                // top back middle
                0, 1, -1,
                0, 1, -1,
                0, 1, -1,
                0, 1, -1,
                0, 1, -1,
                0, 1, -1,

                // top back right
                1, 1, -1,
                1, 1, -1,
                1, 1, -1,
                1, 1, -1,
                1, 1, -1,
                1, 1, -1,

                // top front right
                1, 1, 1,
                1, 1, 1,
                1, 1, 1,
                1, 1, 1,
                1, 1, 1,
                1, 1, 1,

                // top back middle
                0, 1, 1,
                0, 1, 1,
                0, 1, 1,
                0, 1, 1,
                0, 1, 1,
                0, 1, 1,

                // top front left
                -1, 1, 1,
                -1, 1, 1,
                -1, 1, 1,
                -1, 1, 1,
                -1, 1, 1,
                -1, 1, 1,

                // top back left
                -1, 1, -1,
                -1, 1, -1,
                -1, 1, -1,
                -1, 1, -1,
                -1, 1, -1,
                -1, 1, -1,


                // front right corner
                1, 0, 1,
                1, 0, 1,
                1, 0, 1,
                1, 0, 1,

                // front left corner
                -1, 0, 1,
                -1, 0, 1,
                -1, 0, 1,
                -1, 0, 1,

                // back left corner
                -1, 0, -1,
                -1, 0, -1,
                -1, 0, -1,
                -1, 0, -1,

                // back right corner
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,
                1, 0, -1,

                // right corner
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                // left corner
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
            ]
        }
    }
}