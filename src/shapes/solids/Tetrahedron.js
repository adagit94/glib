import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Tetrahedron extends Shape {
    constructor(name, ctx, squareSide, optionals) {
        super(name, ctx, () => {
            const squareSideHalf = squareSide / 2
            
            const invertNormals = !!optionals?.invertNormals
            const openedSides = Array.isArray(optionals?.opened) ? optionals.opened : typeof optionals?.opened === "string" ? [optionals.opened] : undefined

            let vertices = [], normals = []

            if (!openedSides?.includes("x-y-z+")) {
                vertices.push(squareSideHalf, -squareSideHalf, squareSideHalf)
                vertices.push(-squareSideHalf, -squareSideHalf, -squareSideHalf)
                vertices.push(-squareSideHalf, squareSideHalf, squareSideHalf)
                normals.push(-1, -1, 1)
                normals.push(-1, -1, 1)
                normals.push(-1, -1, 1)
            }

            if (!openedSides?.includes("x+y+z+")) {
                vertices.push(-squareSideHalf, squareSideHalf, squareSideHalf)
                vertices.push(squareSideHalf, squareSideHalf, -squareSideHalf)
                vertices.push(squareSideHalf, -squareSideHalf, squareSideHalf)
                normals.push(1, 1, 1)
                normals.push(1, 1, 1)
                normals.push(1, 1, 1)
            }

            if (!openedSides?.includes("x+y-z-")) {
                vertices.push(-squareSideHalf, -squareSideHalf, -squareSideHalf)
                vertices.push(squareSideHalf, -squareSideHalf, squareSideHalf)
                vertices.push(squareSideHalf, squareSideHalf, -squareSideHalf)
                normals.push(1, -1, -1)
                normals.push(1, -1, -1)
                normals.push(1, -1, -1)
            }

            if (!openedSides?.includes("x-y+z-")) {
                vertices.push(-squareSideHalf, squareSideHalf, squareSideHalf)
                vertices.push(squareSideHalf, squareSideHalf, -squareSideHalf)
                vertices.push(-squareSideHalf, -squareSideHalf, -squareSideHalf)
                normals.push(-1, 1, -1)
                normals.push(-1, 1, -1)
                normals.push(-1, 1, -1)
            }

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals }
        })
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES)
    }
}

export default Tetrahedron