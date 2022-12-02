import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Octahedron extends Shape {
    constructor(name, ctx, squareSide, height, optionals) {
        super(name, ctx, () => {
            const invertNormals = !!optionals?.invertNormals
            
            const sidesNormals = [
                // top front
                VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2])),
                // top back
                VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2])),
                // top right
                VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [squareSide / 2, 0, squareSide / 2])),
                // top left
                VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2])),
                // bottom front
                VecUtils.cross(VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2])),
                // bottom back
                VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, -squareSide / 2])),
                // bottom right
                VecUtils.cross(VecUtils.subtract([0, -height, 0], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2])),
                // bottom left
                VecUtils.cross(VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, squareSide / 2])),
            ]
            let verticesNormals = []

            for (let sideNormal of sidesNormals) {
                if (invertNormals) {
                    sideNormal = sideNormal.map(coord => coord * -1)
                }

                verticesNormals.push(...sideNormal, ...sideNormal, ...sideNormal)
            }
            
            return {
                vertices: [
                    // front top triangle
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    0, height, 0,

                    // back top triangle
                    squareSide / 2, 0, -squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,

                    // right top triangle
                    squareSide / 2, 0, squareSide / 2,
                    squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,

                    // left top triangle
                    -squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, -squareSide / 2,
                    0, height, 0,

                    // front bottom triangle
                    squareSide / 2, 0, squareSide / 2,
                    -squareSide / 2, 0, squareSide / 2,
                    0, -height, 0,

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
                normals: verticesNormals,
            }})
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES)
    }
}

export default Octahedron