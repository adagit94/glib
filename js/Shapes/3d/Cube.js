class Cube {
    constructor(sideLength, wireframe) {
        const sideHalfLength = sideLength / 2
        
        this.vertices = new Float32Array([
            sideHalfLength, sideHalfLength, sideHalfLength, // 0
            sideHalfLength, -sideHalfLength, sideHalfLength, // 1
            -sideHalfLength, -sideHalfLength, sideHalfLength, // 2
            -sideHalfLength, sideHalfLength, sideHalfLength, // 3

            sideHalfLength, sideHalfLength, -sideHalfLength, // 4
            sideHalfLength, -sideHalfLength, -sideHalfLength, // 5

            -sideHalfLength, sideHalfLength, -sideHalfLength, // 6
            -sideHalfLength, -sideHalfLength, -sideHalfLength, // 7
        ])

        this.indices = new Uint16Array(wireframe ? [
            0, 1,
            1, 2,
            2, 3,
            3, 0,

            0, 4,
            4, 5,
            5, 1,
            1, 0,

            3, 6,
            6, 7,
            7, 2,
            2, 3,

            4, 6,
            6, 7,
            7, 5, 
            5, 4,

            0, 4,
            4, 6,
            6, 3,
            3, 0,

            1, 5,
            5, 7,
            7, 2,
            2, 1

            // 0, 1,
            // 1, 2,
            // 2, 3,
            // 3, 0,

            // 0, 4,
            // 4, 5,
            // 5, 1,

            // 3, 6,
            // 6, 7,
            // 7, 2,

            // 4, 6,

            // 5, 7
        ] : [
            0, 1, 2,
            2, 3, 0,

            0, 4, 5,
            5, 1, 0,

            4, 6, 7,
            7, 5, 4,

            3, 2, 6,
            2, 7, 6,

            3, 0, 4,
            4, 6, 3,

            1, 5, 7,
            2, 7, 1
        ])

        this.normals = new Float32Array(wireframe ? [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // -1, -1, -1, 
            // -1, 1, -1, 
            // -1, 1, -1,
            // 1, 1, -1,
            // 1, 1, -1, 
            // 1, -1, -1, 
            // 1, -1, -1, 
            // -1, -1, -1,
            
            // -1, -1, -1,
            // -1, -1, 1,
            // -1, -1, 1,
            // -1, 1, 1,
            // -1, 1, 1,
            // -1, 1, -1,

            // 1, -1, -1,
            // 1, -1, 1,
            // 1, -1, 1,
            // 1, 1, 1,
            // 1, 1, 1,
            // 1, 1, -1,

            // -1, -1, 1,
            // 1, -1, 1,
            
            // -1, 1, 1,
            // 1, 1, 1,
        ] : [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
        ])
    }

    vertices
    indices
    normals
}

export default Cube