import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";
import ShapeUtils from "../ShapeUtils.js";

class PentagonalPyramid extends Shape {
    static initPentagonVertices(circumradius) {
        let vertices = []
        const pentaAngleStep = Math.PI * 2 / 5

        for (let v = 0; v <= 5; v++) {
            const angle = -Math.PI / 2 - pentaAngleStep * v
            const x = Math.cos(angle) * circumradius
            const z = Math.sin(angle) * circumradius

            vertices.push([x, 0, z])
        }

        return vertices
    }

    static setTriangularFaces(vertices, normals, indices, pentaSourceVertices, apexVertex) {
        for (let v = 0, vIndex = vertices.length / 3; v < 5; v++) {
            const v0 = pentaSourceVertices[v]
            const v1 = pentaSourceVertices[v + 1]
            const normal = VecUtils.cross(VecUtils.subtract(v1, v0), VecUtils.subtract(apexVertex, v0))
            ShapeUtils.setGeometryData([vertices, [apexVertex, v0, v1]], [normals, normal], [indices, [vIndex++, vIndex++, vIndex++]])
        }
    }
    
    constructor(ctx, pentaCircumradius, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const openedBase = optionals?.opened === "base"
            const invertNormals = !!optionals?.invertNormals

            const pentaVertices = PentagonalPyramid.initPentagonVertices(pentaCircumradius)
            const height = typeof optionals?.height === "number" ? optionals.height : VecUtils.distance(pentaVertices[0], pentaVertices[1]) * Math.sqrt((5 - Math.sqrt(5)) / 10)
            let vertices = [], normals = [], indices = []
            
            PentagonalPyramid.setTriangularFaces(vertices, normals, indices, pentaVertices, [0, height, 0])

            if (!openedBase) {
                let baseIndices = [15, 16, 17]
                
                ShapeUtils.setGeometryData([vertices, [pentaVertices[0], pentaVertices[1], pentaVertices[4]]], [normals, [0, -1, 0], invertNormals], [indices, baseIndices, true])
                ShapeUtils.setGeometryData([vertices, [pentaVertices[1], pentaVertices[2], pentaVertices[3]]], [normals, [0, -1, 0], invertNormals], [indices, baseIndices, true])
                ShapeUtils.setGeometryData([vertices, [pentaVertices[3], pentaVertices[4], pentaVertices[1]]], [normals, [0, -1, 0], invertNormals], [indices, baseIndices])
            }

            return { vertices, normals, indices }
        })
    }
}

export default PentagonalPyramid