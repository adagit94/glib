import VecUtils from "../utils/VecUtils.js";

class ShapeUtils {
    static setGeometryData(vertices, normals, indices, colors) {
        let [verticesSum, verticesToAdd] = vertices;
        let [indicesSum, indicesToAdd, incrementIndices = true] = indices;
        let [normalsSum, normalsToAdd, invertNormals, repeatNormal = true] = normals;

        verticesSum.push(...verticesToAdd.flat());

        indicesSum.push(...indicesToAdd);
        if (incrementIndices) {
            for (let i = 0; i < indicesToAdd.length; i++) {
                indicesToAdd[i] += verticesToAdd.length;
            }
        }

        let vertexDataToRepeat = [];

        if (invertNormals) normalsToAdd = normalsToAdd.flat().map(coord => coord * -1);

        if (repeatNormal) {
            vertexDataToRepeat.push([normalsToAdd, normalsSum]);
        } else {
            normalsSum.push(...normalsToAdd);
        }

        if (colors) {
            let [colorsSum, colorsToAdd, repeatColor] = colors;

            if (repeatColor) {
                vertexDataToRepeat.push([colorsToAdd, colorsSum]);
            } else {
                colorsSum.push(...colorsToAdd.flat());
            }
        }

        if (vertexDataToRepeat.length > 0) {
            ShapeUtils.#repeatVertexData(verticesToAdd.length, vertexDataToRepeat);
        }
    }

    static #repeatVertexData(verticesCount, dataItems) {
        for (let i = 0; i < verticesCount; i++) {
            for (const dataItem of dataItems) {
                const [input, dataSet] = dataItem;

                dataSet.push(...input);
            }
        }
    }

    static redefineCoords(currentCoords, coordsSetHandler) {
        let newCoords = [];

        for (let coord = 0, set = 0; coord < currentCoords.length; coord += 3, set++) {
            const coordsSet = currentCoords.slice(coord, coord + 3);

            newCoords.push(...coordsSetHandler(coordsSet, set));
        }

        return newCoords;
    }

    static sortTriangleIndices(refPoint, indices, getCoordsSets, order) {
        const sortFunc = order === "asc" ? (t1, t2) => t1.cosSum - t2.cosSum : (t1, t2) => t2.cosSum - t1.cosSum;

        let triangles = [];
        let sortedIndices = [];

        for (let i = 0; i < indices.length; i += 3) {
            let vertIndices = [];
            let cosSum = 0;

            for (let offset = 0; offset < 3; offset++) {
                const index = indices[i + offset];
                const firstCoordI = index * 3;
                const { vertex, normal } = getCoordsSets(firstCoordI);

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

    static computeTrianglesNormals(initialNormals, verticesCoords) {
        const verticesCount = verticesCoords.length / 3;
        let normalsCoords = [];

        for (let v = 0; v < verticesCount; ) {
            const offset = v * 3;
            const initialFaceNormal = initialNormals.slice(offset, offset + 3);
            let vertices = [];

            for (let vv = v; vv < v + 3; vv++) {
                const firstCoord = vv * 3;

                vertices.push(verticesCoords.slice(firstCoord, firstCoord + 3));
            }

            const faceNormal = this.#correctPolarity(
                initialFaceNormal,
                VecUtils.cross(VecUtils.subtract(vertices[1], vertices[0]), VecUtils.subtract(vertices[2], vertices[0]))
            );
            let faceVerticesCount = 3;

            while (true) {
                const nextNormal = initialNormals.slice(offset + faceVerticesCount * 3, offset + faceVerticesCount * 3 + 3);

                if (nextNormal.length && VecUtils.compare(initialFaceNormal, nextNormal)) {
                    faceVerticesCount++;
                } else {
                    break;
                }
            }

            for (let vv = 0; vv < faceVerticesCount; vv++) {
                normalsCoords.push(...faceNormal);
            }

            v += faceVerticesCount;
        }

        return normalsCoords;
    }

    static #correctPolarity(initialVec, currentVec, axis = 0) {
        if (initialVec[axis] > 0) {
            currentVec[axis] = Math.abs(currentVec[axis]);
        } else if (initialVec[axis] < 0) {
            currentVec[axis] = -Math.abs(currentVec[axis]);
        }

        if (axis === 2) return currentVec;
        return this.#correctPolarity(initialVec, currentVec, ++axis);
    }

    static handleFarthestVertices(arr, vert) {
        if (arr[0][0] === undefined || vert[0] < arr[0][0][0]) {
            arr[0][0] = vert;
        }

        if (arr[0][1] === undefined || vert[0] > arr[0][1][0]) {
            arr[0][1] = vert;
        }

        if (arr[1][0] === undefined || vert[1] < arr[1][0][1]) {
            arr[1][0] = vert;
        }

        if (arr[1][1] === undefined || vert[1] > arr[1][1][1]) {
            arr[1][1] = vert;
        }

        if (arr[2][0] === undefined || vert[2] < arr[2][0][2]) {
            arr[2][0] = vert;
        }

        if (arr[2][1] === undefined || vert[2] > arr[2][1][2]) {
            arr[2][1] = vert;
        }
    }

    static getCuboidCenterFromFarthestVertices(verts, axisIndex = 0, center = []) {
        const axisVerts = verts[axisIndex];
        const minVert = axisVerts[0];
        const maxVert = axisVerts[1];
        const distance = VecUtils.distance(minVert, maxVert);

        center[axisIndex] = minVert[axisIndex] + distance / 2;

        if (axisIndex === 2) return center;
        return this.getCuboidCenterFromFarthestVertices(verts, ++axisIndex, center);
    }
}

export default ShapeUtils;
