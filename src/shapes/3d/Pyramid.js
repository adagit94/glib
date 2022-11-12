import Shape from "../Shape.js";

class Pyramid extends Shape {
    static #INDICES = [
        0, 1, 2,
        2, 3, 0,

        4, 5, 6,

        7, 8, 9,

        10, 11, 12,

        13, 14, 15
    ]

    static #NORMALS = [
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

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
    ]
    
    constructor(name, ctx, squareSide, height) {
        super(name, ctx, () => ({
            vertices: [
                // bottom square
                squareSide / 2, 0, squareSide / 2,
                -squareSide / 2, 0, squareSide / 2,
                -squareSide / 2, 0, -squareSide / 2,
                squareSide / 2, 0, -squareSide / 2,

                // front triangle
                squareSide / 2, 0, squareSide / 2,
                -squareSide / 2, 0, squareSide / 2,
                0, height ?? squareSide, 0,

                // back triangle
                squareSide / 2, 0, -squareSide / 2,
                -squareSide / 2, 0, -squareSide / 2,
                0, height ?? squareSide, 0,

                // right triangle
                squareSide / 2, 0, squareSide / 2,
                squareSide / 2, 0, -squareSide / 2,
                0, height ?? squareSide, 0,

                // left triangle
                -squareSide / 2, 0, squareSide / 2,
                -squareSide / 2, 0, -squareSide / 2,
                0, height ?? squareSide, 0,
            ],
            indices: Pyramid.#INDICES,
            normals: Pyramid.#NORMALS,
        }))
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Pyramid