export default class HexagonUtils {
    static getHexagonData(squareSide) {
        return {
            vertices: [
             // bottom
            -squareSide / 2, -2 * squareSide, squareSide / 2, // 0
            -squareSide / 2, -2 * squareSide, -squareSide / 2, // 1
            squareSide / 2, -2 * squareSide, -squareSide / 2, // 2
            squareSide / 2, -2 * squareSide, squareSide / 2, // 3
            -squareSide * 1.5, -2 * squareSide, 0, // 4
            squareSide * 1.5, -2 * squareSide, 0, // 5

            ],
            indices: [

            ],
            normals: [

            ]
        }
    }
}