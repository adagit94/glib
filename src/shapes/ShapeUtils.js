class ShapeUtils {
    static setGeometryData(verticesCount, vertices, normals, indices) {
        const [verticesSum, verticesToAdd] = vertices
        let [normalsSum, normalToAdd, invertNormal] = normals

        if (invertNormal) normalToAdd = normalToAdd.map(coord => coord * -1)

        verticesSum.push(...verticesToAdd.flat())

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