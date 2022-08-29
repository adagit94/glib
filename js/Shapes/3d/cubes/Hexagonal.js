class HexagonalCube {
    constructor(squareSide, wireframe) {
        const squareSideHalf = squareSide / 2
        const triangleRectW = squareSide / 4

        const hexagonalPlate = [
            // front
            -squareSideHalf, -squareSideHalf, squareSideHalf, // 0
            -squareSideHalf, squareSideHalf, squareSideHalf, // 1
            squareSideHalf, squareSideHalf, squareSideHalf, // 2
            squareSideHalf, -squareSideHalf, squareSideHalf, // 3
            -squareSideHalf - triangleRectW, 0, squareSideHalf, // 4
            squareSideHalf + triangleRectW, 0, squareSideHalf, // 5

            //  top
            -squareSideHalf - triangleRectW, squareSideHalf, 0, // 6
            -squareSideHalf, squareSideHalf, -squareSideHalf, // 7
            squareSideHalf, squareSideHalf, -squareSideHalf, // 8
            squareSideHalf + triangleRectW, squareSideHalf, 0, // 9
            
            // back
            -squareSideHalf - triangleRectW, 0, -squareSideHalf, // 10
            -squareSideHalf, -squareSideHalf, -squareSideHalf, // 11
            squareSideHalf, -squareSideHalf, -squareSideHalf, // 12
            squareSideHalf + triangleRectW, 0, -squareSideHalf, // 13

            // bottom
            -squareSideHalf - triangleRectW, -squareSideHalf, 0, // 14
            squareSideHalf + triangleRectW, -squareSideHalf, 0, // 15

        ]
        
        this.coordinates = new Float32Array()
        this.indices = new Uint16Array(wireframe ? this.#getLinesIndices() : this.#getTrianglesIndices())
        // this.normals = new Float32Array([
        //     0, 0, 1,
        //     0, 0, 1,
        //     0, 0, 1,
        //     0, 0, 1,
        //     0, 0, 1,
        //     0, 0, 1,
        // ])
    }

    coordinates
    indices
    normals

    #getLinesIndices() {
        return [
            // front hexagon
            0, 4, 4, 1, 1, 2, 2, 5, 5, 3, 3, 0,

            // top hexagon
            1, 6, 6, 7, 7, 8, 8, 9, 9, 2,

            // back hexagon
            8, 13, 13, 12, 12, 11, 11, 10, 10, 7,

            // bottom hexagon
            0, 14, 14, 11, 12, 15, 15, 3,
        ]
    }

    #getTrianglesIndices() {
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

export default HexagonalCube