export default class HexagonUtils {
    static getHexagonalPlateData() {
        const squareSide = 0.25
        
        return {
            vertices: new Float32Array([
                -squareSide, -squareSide * 2, -squareSide, // 0
                squareSide, -squareSide * 2, -squareSide, // 1
                squareSide, -squareSide * 2, squareSide, // 2
                -squareSide, -squareSide * 2, squareSide, // 3

                -squareSide, squareSide * 2, -squareSide, // 4
                squareSide, squareSide * 2, -squareSide, // 5
                squareSide, squareSide * 2, squareSide, // 6
                -squareSide, squareSide * 2, squareSide, // 7
                
                squareSide * 2, -squareSide, -squareSide * 2, // 8
                squareSide * 3, 0, -squareSide, // 9
                squareSide * 3, 0, squareSide, // 10
                squareSide * 2, -squareSide, squareSide * 2, // 11

                squareSide * 2, squareSide, -squareSide * 2, // 12
                squareSide * 2, squareSide, squareSide * 2, // 13

                -squareSide * 2, -squareSide, -squareSide * 2, // 14
                -squareSide * 3, 0, -squareSide, // 15
                -squareSide * 3, 0, squareSide, // 16
                -squareSide * 2, -squareSide, squareSide * 2, // 17

                -squareSide * 2, squareSide, -squareSide * 2, // 18
                -squareSide * 2, squareSide, squareSide * 2, // 19
            ]),
            indices: new Uint16Array([
                0, 1, 2,
                0, 3, 2,

                4, 5, 6,
                4, 7, 6,

                1, 8, 9,
                2, 11, 10,
                1, 9, 2,
                2, 10, 9,

                9, 12, 5,
                10, 13, 6,
                9, 5, 6,
                9, 10, 6,

                0, 14, 15,
                3, 17, 16,
                0, 15, 16,
                0, 3, 16,

                15, 18, 4,
                16, 19, 7,
                15, 4, 16,
                4, 7, 16
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