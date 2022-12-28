import MatUtils from "../utils/MatUtils.js";
import VecUtils from "../utils/VecUtils.js";

class ShapeUtils {
    static setGeometryData(vertices, normals, indices) {
        let [verticesSum, verticesToAdd] = vertices;
        let [normalsSum, normalToAdd, invertNormal] = normals;
        let [indicesSum, indicesToAdd, incrementIndices] = indices;

        verticesSum.push(...verticesToAdd.flat());
        
        if (invertNormal) normalToAdd = normalToAdd.map((coord) => coord * -1);
        for (let v = 0; v < verticesToAdd.length; v++) {
            normalsSum.push(...normalToAdd);
        }

        indicesSum.push(...indicesToAdd);
        if (incrementIndices) {
            for (let i = 0; i < indicesToAdd.length; i++) {
                indicesToAdd[i] += verticesToAdd.length;
            }
        }
    }

    static transposeTriangleIndices(refPoint, modelMat, geometryData, order) {
        const { vertices: coords, indices, normals } = geometryData;
        const sortFunc = order === "asc" ? (t1, t2) => t1.cosSum - t2.cosSum : (t1, t2) => t2.cosSum - t1.cosSum;

        let triangles = [];
        let sortedIndices = [];

        for (let i = 0; i < indices.length; i += 3) {
            let vertIndices = [];
            let cosSum = 0;

            for (let offset = 0; offset < 3; offset++) {
                const index = indices[i + offset];
                const firstCoordI = index * 3;
                const vertex = MatUtils.multVertWithMats3d(coords.slice(firstCoordI, firstCoordI + 3), modelMat);
                const normal = MatUtils.multVertWithMats3d(normals.slice(firstCoordI, firstCoordI + 3), MatUtils.normal3d(modelMat));

                cosSum += VecUtils.dot(normal, VecUtils.subtract(refPoint, vertex));
                vertIndices.push(index);
            }

            triangles.push({ cosSum, indices: vertIndices });
        }

        triangles.sort(sortFunc);

        for (const t of triangles) {
            sortedIndices.push(...t.indices);
        }

        return sortedIndices;
    }
}

export default ShapeUtils;
