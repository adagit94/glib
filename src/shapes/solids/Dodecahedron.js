import MatUtils from "../../utils/MatUtils.js"
import VecUtils from "../../utils/VecUtils.js"
import AngleUtils from "../../utils/AngleUtils.js"
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
            const pentaHeight = pentaCircumradius + pentaInradius
            const pentaZOffset = (pentaCircumradius - pentaInradius) / 2
            const dihedralAngle = Math.acos(-Math.sqrt(5) / 5)

            const bottomFaceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, MatUtils.translated3d(0, -dodecaInradius, pentaZOffset)))
            
            vertices.push(...bottomFaceVertices.flat())
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

            {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle), MatUtils.translated3d(0, -dodecaInradius, pentaZOffset)]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[2], faceVertices[2])

                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))

                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))
                
                vertices.push(...faceVertices.flat())
                normals.push(
                    ...normal,
                    ...normal,
                    ...normal,
                    ...normal,
                    ...normal,
                )
                indices.push(
                    5, 6, 9,
                    6, 9, 7,
                    7, 8, 9
                )
            }

            const topFaceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("y", Math.PI), MatUtils.translated3d(0, dodecaInradius, -pentaZOffset)]))
            
            vertices.push(...topFaceVertices.flat())
            normals.push(
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
            )
            indices.push(
                10, 11, 14,
                11, 14, 12,
                12, 13, 14
            )

            {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(36)), MatUtils.translated3d(0, dodecaInradius, -pentaZOffset)]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[4], faceVertices[2])

                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))

                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))
                
                vertices.push(...faceVertices.flat())
                normals.push(
                    ...normal,
                    ...normal,
                    ...normal,
                    ...normal,
                    ...normal,
                )
                indices.push(
                    15, 16, 19,
                    16, 19, 17,
                    17, 18, 19
                )
            }

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals, indices }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Dodecahedron