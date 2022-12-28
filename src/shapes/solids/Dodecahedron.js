import MatUtils from "../../utils/MatUtils.js"
import VecUtils from "../../utils/VecUtils.js"
import AngleUtils from "../../utils/AngleUtils.js"
import Shape from "../Shape.js"
import ShapeUtils from "../ShapeUtils.js"

class Dodecahedron extends Shape {
    constructor(ctx, pentaCircumradius, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const opened = Array.isArray(optionals?.opened) ? optionals.opened : typeof optionals?.opened === "string" ? [optionals.opened] : undefined
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
            const dihedralAngle = Math.acos(-Math.sqrt(5) / 5)

            let faceIndices = [0, 1, 4, 1, 4, 2, 2, 3, 4]

            // Y+
            const topFaceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("y", Math.PI), MatUtils.translated3d(0, dodecaInradius, 0)]))
            if (!opened?.includes("y+")) {
                ShapeUtils.setGeometryData([vertices, topFaceVertices], [normals, [0, 1, 0]], [indices, faceIndices, true])
            }
            
            // Y-
            const bottomFaceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, MatUtils.translated3d(0, -dodecaInradius, 0)))
            if (!opened?.includes("y-")) {
                ShapeUtils.setGeometryData([vertices, bottomFaceVertices], [normals, [0, -1, 0,]], [indices, faceIndices, true])
            }

            // Y-Z+
            if (!opened?.includes("y-z+")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle)]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[2], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))
                
                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X-Y-Z+
            if (!opened?.includes("x-y-z+")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(36))]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[4], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))
                
                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X+Y+Z+
            if (!opened?.includes("x+y+z+")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", -AngleUtils.degToRad(36))]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[1], faceVertices[3])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))
                
                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // Y-Z-
            if (!opened?.includes("y-z-")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", Math.PI)]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[2], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))
                
                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X-Y-Z-
            if (!opened?.includes("x-y-z-")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(180 - 36))]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[0], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))

                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X+Y-Z-
            if (!opened?.includes("x+y-z-")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(180 + 36))]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[0], faceVertices[3])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))

                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X-Y+Z-
            if (!opened?.includes("x-y+z-")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(108))]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[4], faceVertices[3])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))

                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X-Y+Z+
            if (!opened?.includes("x-y+z+")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(72))]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[1], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))

                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X+Y+Z-
            if (!opened?.includes("x+y+z-")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(180 + 72))]))
                const transpositionVec = VecUtils.subtract(topFaceVertices[1], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[1], faceVertices[2]), VecUtils.subtract(faceVertices[3], faceVertices[2]))

                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices, true])
            }

            // X+Y-Z+
            if (!opened?.includes("x+y-z+")) {
                let faceVertices = pentagonVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", -dihedralAngle), MatUtils.rotated3d("y", AngleUtils.degToRad(-72))]))
                const transpositionVec = VecUtils.subtract(bottomFaceVertices[3], faceVertices[2])
                faceVertices = faceVertices.map(vert => VecUtils.add(vert, transpositionVec))
                const normal = VecUtils.cross(VecUtils.subtract(faceVertices[3], faceVertices[2]), VecUtils.subtract(faceVertices[1], faceVertices[2]))
                
                ShapeUtils.setGeometryData([vertices, faceVertices], [normals, normal], [indices, faceIndices])
            }

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals, indices }
        })
    }
}

export default Dodecahedron