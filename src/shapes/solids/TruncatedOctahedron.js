import Shape from "../Shape.js";
import HexagonUtils from "./Hexagon/HexagonUtils.js";

class TruncatedOctahedron extends Shape {
    constructor(name, ctx, pyrSquareLength, truncPyrSquareLength) {
        super(name, ctx, () => {
            let vertices = [], normals = [], indices = []

            const pyrHalf = pyrSquareLength / 2
            const truncPyrHalf = truncPyrSquareLength / 2

            const truncPyrArea = Math.pow(truncPyrSquareLength, 2)
            const h =  Math.sqrt(truncPyrArea - truncPyrArea / 4) // Math.sqrt(truncPyrArea - truncPyrArea / 2)

            vertices.push(pyrHalf - truncPyrSquareLength, 0, pyrHalf)
            vertices.push(pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(pyrHalf - truncPyrHalf, h, pyrHalf - truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -h, pyrHalf - truncPyrHalf)

            normals.push(1, 0, 1)
            normals.push(1, 0, 1)
            normals.push(1, 0, 1)
            normals.push(1, 0, 1)

            // const frontRightSquareVertex = []

        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default TruncatedOctahedron;
