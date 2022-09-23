class SquareCuboid {
    static #NORMALS = [
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
    ]

    static #INDICES = [
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
    ]

    static #WIREFRAME_INDICES = [
        0, 1,
        1, 2,
        2, 3,
        3, 0,

        4, 5,
        5, 6,
        6, 7,
        7, 4,

        8, 9,
        9, 10,
        10, 11,
        11, 8,
        
        12, 13,
        13, 14,
        14, 15,
        15, 12,

        16, 17,
        17, 18,
        18, 19,
        19, 16,

        20, 21,
        21, 22,
        22, 23,
        23, 20,
    ]

    constructor(width, height, wireframe) {
        const widthHalf = width / 2
        const heightHalf = height / 2
        
        this.vertices = [
            // FRONT
            widthHalf, heightHalf, heightHalf, // 0
            widthHalf, -heightHalf, heightHalf, // 1
            -widthHalf, -heightHalf, heightHalf, // 2
            -widthHalf, sideHalfLength, heightHalf, // 3

            // BACK
            widthHalf, heightHalf, -heightHalf, // 4
            widthHalf, -heightHalf, -heightHalf, // 5
            -widthHalf, -heightHalf, -heightHalf, // 6
            -widthHalf, heightHalf, -heightHalf, // 7           

            // TOP
            widthHalf, heightHalf, heightHalf, // 8
            widthHalf, heightHalf, -heightHalf, // 9
            -widthHalf, heightHalf, -heightHalf, // 10
            -widthHalf, heightHalf, heightHalf, // 11

            // BOTTOM
            widthHalf, -heightHalf, heightHalf, // 12
            widthHalf, -heightHalf, -heightHalf, // 13
            -widthHalf, -heightHalf, -heightHalf, // 14
            -widthHalf, -heightHalf, heightHalf, // 15

            // RIGHT
            widthHalf, heightHalf, heightHalf, // 16
            widthHalf, heightHalf, -heightHalf, // 17
            widthHalf, -heightHalf, -heightHalf, // 18
            widthHalf, -heightHalf, heightHalf, // 19

            // LEFT
            -widthHalf, heightHalf, heightHalf, // 20
            -widthHalf, heightHalf, -heightHalf, // 21
            -widthHalf, -heightHalf, -heightHalf, // 22
            -widthHalf, -heightHalf, heightHalf, // 23
        ]

        this.indices = wireframe ? SquareCuboid.#WIREFRAME_INDICES : SquareCuboid.#INDICES
        this.normals = SquareCuboid.#NORMALS
    }

    vertices
    indices
    normals
}

export default SquareCuboid