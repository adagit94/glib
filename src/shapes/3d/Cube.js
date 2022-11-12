import Shape from "../Shape.js"

class Cube extends Shape {
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

    static #TEXTURE_COORDS = [
        1, 1,
        1, 0,
        0, 0,
        0, 1,

        0, 1,
        0, 0,
        1, 0,
        1, 1,

        1, 0,
        1, 1,
        0, 1,
        0, 0,
        
        1, 0,
        1, 1,
        0, 1,
        0, 0,

        0, 1,
        1, 1,
        1, 0,
        0, 0,

        1, 1,
        0, 1,
        0, 0,
        1, 0,
    ]
    
    constructor(name, ctx, sideLength, wireframe) {
        super(name, ctx, () => {
            const sideHalfLength = sideLength / 2
        
            return {
                vertices: [
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
                ],
                indices: wireframe ? Cube.#WIREFRAME_INDICES : Cube.#INDICES,
                normals: Cube.#NORMALS,
                textureCoords: Cube.#TEXTURE_COORDS
            }
        }, wireframe)
    }

    render = () => {
        this.drawElements(this.wireframe ? this.gl.LINES : this.gl.TRIANGLES)
    }
}

export default Cube