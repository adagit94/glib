export default class HexagonalSphereUtils {
    static getHexagonalPlateData(settings) {
        const {squareSide} = settings
        
        return {
            vertices: new Float32Array([
                -squareSide / 2, -squareSide, 0,
                -squareSide / 2, squareSide, 0,
                squareSide / 2, squareSide, 0, 
                squareSide / 2, -squareSide, 0, 
                -squareSide * 1.5, 0, 0,
                squareSide * 1.5, 0, 0,
            ]),
            indices: new Uint16Array(settings.wireframe ? [0, 4, 4, 1, 1, 2, 2, 5, 5, 3, 3, 0] : [            // square
                0, 1, 3,
                2, 3, 1,

                // triangles
                0, 4, 1,
                3, 5, 2
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

    #getHexagonalPlateTrianglesIndices() {
        return [
            // square
            0, 1, 3,
            2, 3, 1,

            // triangles
            0, 4, 1,
            3, 5, 2
        ]
    }

}