import Shape from "../Shape.js";
import ShapeUtils from "../ShapeUtils.js";

class TrirectangularTetrahedron extends Shape {
    constructor(ctx, squareSide, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const invertNormals = !!optionals?.invertNormals
            const openedSides = Array.isArray(optionals?.opened) ? optionals.opened : typeof optionals?.opened === "string" ? [optionals.opened] : undefined

            const squareSideHalf = squareSide / 2

            let vertices = [], normals = [], indices = []
            let indicesToAdd = [0, 1, 2]

            if (!openedSides?.includes("x+") && !openedSides?.includes("x")) {
                ShapeUtils.setGeometryData([vertices, [[squareSideHalf, squareSideHalf, squareSideHalf], [squareSideHalf, squareSideHalf, -squareSideHalf], [squareSideHalf, -squareSideHalf, squareSideHalf]]], [normals, [1, 0, 0]], [indices, indicesToAdd, true])
            }

            if (!openedSides?.includes("y+") && !openedSides?.includes("y")) {
                ShapeUtils.setGeometryData([vertices, [[-squareSideHalf, squareSideHalf, squareSideHalf], [squareSideHalf, squareSideHalf, -squareSideHalf], [squareSideHalf, squareSideHalf, squareSideHalf]]], [normals, [0, 1, 0]], [indices, indicesToAdd, true])
            }
            
            if (!openedSides?.includes("z+") && !openedSides?.includes("z")) {
                ShapeUtils.setGeometryData([vertices, [[squareSideHalf, -squareSideHalf, squareSideHalf], [squareSideHalf, squareSideHalf, squareSideHalf], [-squareSideHalf, squareSideHalf, squareSideHalf]]], [normals, [0, 0, 1]], [indices, indicesToAdd, true])
            }
            
            if (!openedSides?.includes("x-y-z-") && !openedSides?.includes("base")) {
                ShapeUtils.setGeometryData([vertices, [[squareSideHalf, -squareSideHalf, squareSideHalf], [-squareSideHalf, squareSideHalf, squareSideHalf], [squareSideHalf, squareSideHalf, -squareSideHalf]]], [normals, [-1, -1, -1]], [indices, indicesToAdd])
            }

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals, indices }
        })
    }
}

export default TrirectangularTetrahedron