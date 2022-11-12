import Shape from "../Shape.js";

class Octahedron extends Shape {
    static #INDICES = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23
    ]

    static #NORMALS = [
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,

        0, 1, -1,
        0, 1, -1,
        0, 1, -1,

        1, 1, 0,
        1, 1, 0,
        1, 1, 0,

        -1, 1, 0,
        -1, 1, 0,
        -1, 1, 0,

        0, -1, 1,
        0, -1, 1,
        0, -1, 1,

        0, -1, -1,
        0, -1, -1,
        0, -1, -1,

        1, -1, 0,
        1, -1, 0,
        1, -1, 0,

        -1, -1, 0,
        -1, -1, 0,
        -1, -1, 0,
    ]
    
    constructor(name, ctx, squareSide, height) {
        super(name, ctx, () => {
            if (height === undefined) height = squareSide
            
            return {
                vertices: [
                    // front top triangle
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    0, height , 0,

                    // back top triangle
                    squareSide / 2, 0, -squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height , 0,

                    // right top triangle
                    squareSide / 2, 0, squareSide / 2,
                    squareSide / 2, 0, -squareSide / 2,
                    0, height , 0,

                    // left top triangle
                    -squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height , 0,

                    // front bottom triangle
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    0, -height , 0,

                    // back bottom triangle
                    squareSide / 2, 0, -squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, -height, 0,

                    // right bottom triangle
                    squareSide / 2, 0, squareSide / 2,
                    squareSide / 2, 0, -squareSide / 2,
                    0, -height, 0,

                    // left bottom triangle
                    -squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, -height, 0,
                ],
                indices: Octahedron.#INDICES,
                normals: Octahedron.#NORMALS,
            }})
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Octahedron