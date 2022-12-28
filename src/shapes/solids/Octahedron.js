import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Octahedron extends Shape {
    constructor(ctx, squareSide, height, optionals) {
        super(ctx, optionals?.uniforms, () => {
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

            let normals = [], indices = []

            for (let i = 0; i < 8; i++) {
                const sideNormal = sidesNormals[i]
                const firstTriangleIndex = i * 3
                
                if (invertNormals) {
                    sideNormal = sideNormal.map(coord => coord * -1)
                }

                normals.push(...sideNormal, ...sideNormal, ...sideNormal)
                indices.push(firstTriangleIndex, firstTriangleIndex + 1, firstTriangleIndex + 2)
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
                normals,
                indices
            }})
    }
}

export default Octahedron