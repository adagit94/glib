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

    constructor(name, ctx, squareSide, optionals) {
        super(name, ctx, () => {
            const height = typeof optionals?.height === "number" ? optionals.height : Math.sqrt(squareSide * squareSide / 2)
            const openedBase = optionals?.opened === "base"
            const invertNormals = !!optionals?.invertNormals

            const frontNormal = invertNormals ? VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2])) : VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]))
            const backNormal = invertNormals ? VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, -squareSide / 2])) : VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]))
            const rightNormal = invertNormals ? VecUtils.cross(VecUtils.subtract([0, height, 0], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2])) : VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [squareSide / 2, 0, squareSide / 2]))
            const leftNormal = invertNormals ? VecUtils.cross(VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2])) : VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]))
            const baseNormal = invertNormals ? 1 : -1
            const baseNormals = [
                0, baseNormal, 0,
                0, baseNormal, 0,
                0, baseNormal, 0,
                0, baseNormal, 0
            ]

            const indices = openedBase ? Pyramid.#INDICES.slice(6) : Pyramid.#INDICES
            
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
                normals: [
                    ...baseNormals,
                    
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
                indices,
            }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Pyramid