import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class TruncatedOctahedron extends Shape {
    static #setNormalsAndIndices(verticesCount, allNormals, normal, allIndices, currentIndices, incrementIndices = true) {
        for (let i = 0; i < verticesCount; i++) {
            allNormals.push(...normal)
        }

        if (incrementIndices) {
            for (let i = 0; i < currentIndices.length; i++) {
                currentIndices[i] += verticesCount
            }
        }

        allIndices.push(...currentIndices)
    }
    
    constructor(name, ctx, pyrSquareLength, truncPyrSquareLength) {
        super(name, ctx, () => {
            let vertices = [], normals = [], indices = []

            const pyrHalf = pyrSquareLength / 2
            const pyrArea = Math.pow(pyrSquareLength, 2)
            const pyrH = Math.sqrt(pyrArea / 2)
            
            const truncPyrHalf = truncPyrSquareLength / 2
            const truncPyrArea = Math.pow(truncPyrSquareLength, 2)
            const truncPyrH =  Math.sqrt(truncPyrArea / 2)

            let currentIndices = [0, 1, 2, 0, 1, 3]

            // CORNER SQUARES
            vertices.push(pyrHalf - truncPyrSquareLength, 0, pyrHalf)
            vertices.push(pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [1, 0, 1], indices, currentIndices, false)

            vertices.push(-pyrHalf + truncPyrSquareLength, 0, pyrHalf)
            vertices.push(-pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [-1, 0, 1], indices, currentIndices)

            vertices.push(-pyrHalf + truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(-pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [-1, 0, -1], indices, currentIndices)

            vertices.push(pyrHalf - truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [1, 0, -1], indices, currentIndices)
            
            // APEX SQUARES
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [0, 1, 0], indices, currentIndices)

            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(4, normals, [0, -1, 0], indices, currentIndices)

            // HEXAGONS
            currentIndices = [24, 25, 27, 27, 28, 24, 24, 28, 29, 25, 26, 27]

            vertices.push(pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([pyrHalf, 0, -pyrHalf + truncPyrSquareLength], [pyrHalf, 0, pyrHalf - truncPyrSquareLength]), VecUtils.subtract([truncPyrHalf, pyrH - truncPyrH, truncPyrHalf], [pyrHalf, 0, pyrHalf - truncPyrSquareLength])), indices, currentIndices, false)
            vertices.push(pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf], [pyrHalf, 0, pyrHalf - truncPyrSquareLength]), VecUtils.subtract([pyrHalf, 0, -pyrHalf + truncPyrSquareLength], [pyrHalf, 0, pyrHalf - truncPyrSquareLength])), indices, currentIndices)

            vertices.push(pyrHalf - truncPyrSquareLength, 0, pyrHalf)
            vertices.push(-pyrHalf + truncPyrSquareLength, 0, pyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([pyrHalf - truncPyrSquareLength, 0, pyrHalf], [-pyrHalf + truncPyrSquareLength, 0, pyrHalf]), VecUtils.subtract([-truncPyrHalf, pyrH - truncPyrH, truncPyrHalf], [-pyrHalf + truncPyrSquareLength, 0, pyrHalf])), indices, currentIndices)
            vertices.push(pyrHalf - truncPyrSquareLength, 0, pyrHalf)
            vertices.push(-pyrHalf + truncPyrSquareLength, 0, pyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([-truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf], [-pyrHalf + truncPyrSquareLength, 0, pyrHalf]), VecUtils.subtract([pyrHalf - truncPyrSquareLength, 0, pyrHalf], [-pyrHalf + truncPyrSquareLength, 0, pyrHalf])), indices, currentIndices)

            vertices.push(-pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(-pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, truncPyrHalf)
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([-truncPyrHalf, pyrH - truncPyrH, truncPyrHalf], [-pyrHalf, 0, pyrHalf - truncPyrSquareLength]), VecUtils.subtract([-pyrHalf, 0, -pyrHalf + truncPyrSquareLength], [-pyrHalf, 0, pyrHalf - truncPyrSquareLength])), indices, currentIndices)
            vertices.push(-pyrHalf, 0, -pyrHalf + truncPyrSquareLength)
            vertices.push(-pyrHalf, 0, pyrHalf - truncPyrSquareLength)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, pyrHalf - truncPyrHalf)
            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf)
            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([-pyrHalf, 0, -pyrHalf + truncPyrSquareLength], [-pyrHalf, 0, pyrHalf - truncPyrSquareLength]), VecUtils.subtract([-truncPyrHalf, -pyrH + truncPyrH, truncPyrHalf], [-pyrHalf, 0, pyrHalf - truncPyrSquareLength])), indices, currentIndices)

            vertices.push(pyrHalf - truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(-pyrHalf + truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            vertices.push(-truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([-truncPyrHalf, pyrH - truncPyrH, -truncPyrHalf], [-pyrHalf + truncPyrSquareLength, 0, -pyrHalf]), VecUtils.subtract([pyrHalf - truncPyrSquareLength, 0, -pyrHalf], [-pyrHalf + truncPyrSquareLength, 0, -pyrHalf])), indices, currentIndices)
            vertices.push(pyrHalf - truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(-pyrHalf + truncPyrSquareLength, 0, -pyrHalf)
            vertices.push(-pyrHalf + truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            vertices.push(-truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf)
            vertices.push(pyrHalf - truncPyrHalf, -truncPyrH, -pyrHalf + truncPyrHalf)
            TruncatedOctahedron.#setNormalsAndIndices(6, normals, VecUtils.cross(VecUtils.subtract([pyrHalf - truncPyrSquareLength, 0, -pyrHalf], [-pyrHalf + truncPyrSquareLength, 0, -pyrHalf]), VecUtils.subtract([-truncPyrHalf, -pyrH + truncPyrH, -truncPyrHalf], [-pyrHalf + truncPyrSquareLength, 0, -pyrHalf])), indices, currentIndices)

            return { vertices, normals, indices }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default TruncatedOctahedron;
