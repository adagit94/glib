import MatUtils from "../../utils/MatUtils.js"
import VecUtils from "../../utils/VecUtils.js"
import Shape from "../Shape.js"

class Dodecahedron extends Shape {
    constructor(name, ctx, pentaCircumradius, optionals) {
        super(name, ctx, () => {
            const invertNormals = !!optionals?.invertNormals
            
            let vertices = [], normals = [], indices = []
            let pentagonVertices = []
            
            const angleStep = Math.PI * 2 / 5

            for (let v = 0; v < 5; v++) {
                const angle = -Math.PI / 2 - angleStep * v
                const x = Math.cos(angle) * pentaCircumradius
                const z = Math.sin(angle) * pentaCircumradius

                pentagonVertices.push([x, 0, z])
            }

            const edgeLength = VecUtils.distance(pentagonVertices[0], pentagonVertices[1])
            const dodecaInradius = edgeLength * 0.5 * Math.sqrt(5 / 2 + 11 / 10 * Math.sqrt(5))
            const pentaInradius = edgeLength / (2 * Math.tan(Math.PI / 5))
            const pentaZOffset = (pentaCircumradius - pentaInradius) / 2
            const dihedralAngle = Math.acos(-Math.sqrt(5) / 5)

            pentagonVertices = pentagonVertices.map(vert => MatUtils.multVertWithMat3d(vert, MatUtils.translated3d(0, -dodecaInradius, pentaZOffset)))

            vertices.push(...pentagonVertices.flat())
            normals.push(
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
            )
            indices.push(
                0, 1, 4,
                1, 4, 2,
                2, 3, 4
            )

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals, indices }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Dodecahedron