import AngleUtils from "../../utils/AngleUtils.js"
import MatUtils from "../../utils/MatUtils.js"
import VecUtils from "../../utils/VecUtils.js"
import Shape from "../Shape.js"
import ShapeUtils from "../ShapeUtils.js"
import PentagonalPyramid from "./PentagonalPyramid.js"

class Icosahedron extends Shape {
    constructor(name, ctx, pentaCircumradius, optionals) {
        super(name, ctx, () => {
            const opened = Array.isArray(optionals?.opened) ? optionals.opened : typeof optionals?.opened === "string" ? [optionals.opened] : undefined
            const invertNormals = !!optionals?.invertNormals
            
            const pentaVertices = PentagonalPyramid.initPentagonVertices(pentaCircumradius)
            let vertices = [], normals = []
            
            const edgeLength = VecUtils.distance(pentaVertices[0], pentaVertices[1])
            const icosaCircumradius = edgeLength * Math.sin(Math.PI * 2 / 5)
            const pentaPyrH = edgeLength * Math.sqrt((5 - Math.sqrt(5)) / 10)
            const pentaPyrBaseY = icosaCircumradius - pentaPyrH

            const topPentaVertices = pentaVertices.map(vert => MatUtils.multVertWithMats3d(vert, MatUtils.translated3d(0, pentaPyrBaseY, 0)))
            
            if (!opened?.includes("y") && !opened?.includes("y+")) {
                PentagonalPyramid.setTriangularFaces(vertices, normals, topPentaVertices, [0, icosaCircumradius, 0])
            }

            const bottomPentaVertices = pentaVertices.map(vert => MatUtils.multVertWithMats3d(vert, [MatUtils.rotated3d("x", Math.PI), MatUtils.translated3d(0, -pentaPyrBaseY, 0)]))

            if (!opened?.includes("y") && !opened?.includes("y-")) {
                PentagonalPyramid.setTriangularFaces(vertices, normals, bottomPentaVertices, [0, -icosaCircumradius, 0])
            }
            
            {
                const triangleVertices = [bottomPentaVertices[0], topPentaVertices[2], topPentaVertices[3]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[3], bottomPentaVertices[0]), VecUtils.subtract(topPentaVertices[2], bottomPentaVertices[0]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[0], bottomPentaVertices[1], topPentaVertices[2]]
                const normal = VecUtils.cross(VecUtils.subtract(bottomPentaVertices[1], topPentaVertices[2]), VecUtils.subtract(bottomPentaVertices[0], topPentaVertices[2]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[1], topPentaVertices[1], topPentaVertices[2]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[1], topPentaVertices[2]), VecUtils.subtract(bottomPentaVertices[1], topPentaVertices[2]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[1], bottomPentaVertices[2], topPentaVertices[1]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[1], bottomPentaVertices[1]), VecUtils.subtract(bottomPentaVertices[2], bottomPentaVertices[1]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }
            
            {
                const triangleVertices = [bottomPentaVertices[2], topPentaVertices[0], topPentaVertices[1]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[0], topPentaVertices[1]), VecUtils.subtract(bottomPentaVertices[2], topPentaVertices[1]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[2], bottomPentaVertices[3], topPentaVertices[0]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[0], bottomPentaVertices[2]), VecUtils.subtract(bottomPentaVertices[3], bottomPentaVertices[2]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[3], topPentaVertices[0], topPentaVertices[topPentaVertices.length - 2]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[topPentaVertices.length - 2], topPentaVertices[0]), VecUtils.subtract(bottomPentaVertices[3], topPentaVertices[0]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[3], bottomPentaVertices[4], topPentaVertices[topPentaVertices.length - 2]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[topPentaVertices.length - 2], bottomPentaVertices[3]), VecUtils.subtract(bottomPentaVertices[4], bottomPentaVertices[3]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[4], topPentaVertices[topPentaVertices.length - 2], topPentaVertices[topPentaVertices.length - 3]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[topPentaVertices.length - 3], topPentaVertices[topPentaVertices.length - 2]), VecUtils.subtract(bottomPentaVertices[4], topPentaVertices[topPentaVertices.length - 2]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            {
                const triangleVertices = [bottomPentaVertices[4], bottomPentaVertices[5], topPentaVertices[topPentaVertices.length - 3]]
                const normal = VecUtils.cross(VecUtils.subtract(topPentaVertices[topPentaVertices.length - 3], bottomPentaVertices[4]), VecUtils.subtract(bottomPentaVertices[5], bottomPentaVertices[4]))
                ShapeUtils.setGeometryData(3, [vertices, triangleVertices], [normals, normal])
            }

            if (invertNormals) normals = normals.map(coord => coord * -1)

            return { vertices, normals }
        })
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES)
    }
}

export default Icosahedron