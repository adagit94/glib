class ShapeUtils {
    static setGeometryData(verticesCount, vertices, normals, indices) {
        const [verticesSum, verticesToAdd] = vertices
        const [normalsSum, normalToAdd] = normals

        verticesSum.push(...verticesToAdd)

        for (let v = 0; v < verticesCount; v++) {
            normalsSum.push(...normalToAdd)
        }

        if (indices) {
            const [indicesSum, faceIndices, incrementIndices] = indices

            if (incrementIndices) {
                for (let i = 0; i < faceIndices.length; i++) {
                    faceIndices[i] += verticesCount
                }
            }

             indicesSum.push(...faceIndices)
        }
    }
}

export default ShapeUtils;