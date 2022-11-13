import VecUtils from "../../utils/VecUtils.js";
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

    constructor(name, ctx, squareSide, height) {
        super(name, ctx, () => {
            if (height === undefined) height = squareSide
            
            const frontNormal = VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]))
            const backNormal = VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]))
            const rightNormal = VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [squareSide / 2, 0, squareSide / 2]))
            const leftNormal = VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]))

            return {
                vertices: [
                    // bottom square
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    squareSide / 2, 0, -squareSide / 2,

                    // front triangle
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    0, height, 0,

                    // back triangle
                    squareSide / 2, 0, -squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,

                    // right triangle
                    squareSide / 2, 0, squareSide / 2,
                    squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,

                    // left triangle
                    -squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,
                ],
                indices: Pyramid.#INDICES,
                normals: [
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,
                    0, -1, 0,

                    ...frontNormal,
                    ...frontNormal,
                    ...frontNormal,

                    ...backNormal,
                    ...backNormal,
                    ...backNormal,

                    ...rightNormal,
                    ...rightNormal,
                    ...rightNormal,

                    ...leftNormal,
                    ...leftNormal,
                    ...leftNormal,
                ],
            }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Pyramid