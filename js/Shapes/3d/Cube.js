class Cube {
    constructor(sideLength, wireframe) {
        const sideHalfLength = sideLength / 2
        
        this.vertices = new Float32Array([
            // FRONT
            sideHalfLength, sideHalfLength, sideHalfLength, // 0
            sideHalfLength, -sideHalfLength, sideHalfLength, // 1
            -sideHalfLength, -sideHalfLength, sideHalfLength, // 2
            -sideHalfLength, sideHalfLength, sideHalfLength, // 3

            // BACK
            sideHalfLength, sideHalfLength, -sideHalfLength, // 4
            sideHalfLength, -sideHalfLength, -sideHalfLength, // 5
            -sideHalfLength, -sideHalfLength, -sideHalfLength, // 6
            -sideHalfLength, sideHalfLength, -sideHalfLength, // 7           

            // TOP
            sideHalfLength, sideHalfLength, sideHalfLength, // 8
            sideHalfLength, sideHalfLength, -sideHalfLength, // 9
            -sideHalfLength, sideHalfLength, -sideHalfLength, // 10
            -sideHalfLength, sideHalfLength, sideHalfLength, // 11

            // BOTTOM
            sideHalfLength, -sideHalfLength, sideHalfLength, // 12
            sideHalfLength, -sideHalfLength, -sideHalfLength, // 13
            -sideHalfLength, -sideHalfLength, -sideHalfLength, // 14
            -sideHalfLength, -sideHalfLength, sideHalfLength, // 15

            // RIGHT
            sideHalfLength, sideHalfLength, sideHalfLength, // 16
            sideHalfLength, sideHalfLength, -sideHalfLength, // 17
            sideHalfLength, -sideHalfLength, -sideHalfLength, // 18
            sideHalfLength, -sideHalfLength, sideHalfLength, // 19

            // LEFT
            -sideHalfLength, sideHalfLength, sideHalfLength, // 20
            -sideHalfLength, sideHalfLength, -sideHalfLength, // 21
            -sideHalfLength, -sideHalfLength, -sideHalfLength, // 22
            -sideHalfLength, -sideHalfLength, sideHalfLength, // 23
        ])

        this.indices = new Uint16Array(wireframe ? [

        ] : [
          0, 1, 2,
          0, 3, 2,
          
          4, 5, 6,
          4, 7, 6,

          8, 9, 10,
          10, 11, 8,

          12, 13, 14,
          14, 15, 12,

          16, 17, 18,
          16, 19, 18,

          20, 21, 22,
          20, 23, 22,
        ])

        this.normals = new Float32Array(wireframe ? [

        ] : [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ])
    }

    vertices
    indices
    normals
}

export default Cube