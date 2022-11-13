import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Octahedron extends Shape {
    constructor(name, ctx, squareSide, height) {
        super(name, ctx, () => {
            if (height === undefined) height = squareSide
            
            const topFrontNormal = VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]))
            const topBackNormal = VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]))
            const topRightNormal = VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, height, 0], [squareSide / 2, 0, squareSide / 2]))
            const topLeftNormal = VecUtils.cross(VecUtils.subtract([0, height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]))

            const bottomFrontNormal = VecUtils.cross(VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, squareSide / 2], [-squareSide / 2, 0, squareSide / 2]))
            const bottomBackNormal = VecUtils.cross(VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, -squareSide / 2]), VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, -squareSide / 2]))
            const bottomRightNormal = VecUtils.cross(VecUtils.subtract([0, -height, 0], [squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([squareSide / 2, 0, -squareSide / 2], [squareSide / 2, 0, squareSide / 2]))
            const bottomLeftNormal = VecUtils.cross(VecUtils.subtract([-squareSide / 2, 0, -squareSide / 2], [-squareSide / 2, 0, squareSide / 2]), VecUtils.subtract([0, -height, 0], [-squareSide / 2, 0, squareSide / 2]))
            
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
                normals: [
                    ...topFrontNormal,
                    ...topFrontNormal,
                    ...topFrontNormal,

                    ...topBackNormal,
                    ...topBackNormal,
                    ...topBackNormal,

                    ...topRightNormal,
                    ...topRightNormal,
                    ...topRightNormal,

                    ...topLeftNormal,
                    ...topLeftNormal,
                    ...topLeftNormal,

                    ...bottomFrontNormal,
                    ...bottomFrontNormal,
                    ...bottomFrontNormal,

                    ...bottomBackNormal,
                    ...bottomBackNormal,
                    ...bottomBackNormal,

                    ...bottomRightNormal,
                    ...bottomRightNormal,
                    ...bottomRightNormal,

                    ...bottomLeftNormal,
                    ...bottomLeftNormal,
                    ...bottomLeftNormal,
                ],
            }})
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES)
    }
}

export default Octahedron