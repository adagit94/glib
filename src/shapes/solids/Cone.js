import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Cone extends Shape {
    constructor(ctx, baseR, height, density, optionals) {
        super(ctx, optionals?.uniforms, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const opened = instance.opened = partialAngle || !!optionals?.opened
            const invertNormals = instance.invertNormals = !!optionals?.invertNormals
            const angleStep = angle / density

            let vertices = [], normals = [], indices = []
            let vertexIndex = 0
            
            const topVertex = [0, height, 0]
            const baseNy = invertNormals ? 1 : -1
            let baseCenterIndex;
            let lastBaseCircumferenceIndex;
            
            if (!opened) {
                vertices.push(0, 0, 0)
                normals.push(0, baseNy, 0)

                baseCenterIndex = vertexIndex++;
            }

            for (let v = 0; v <= density; v++) {
                const currentAngle = v * angleStep;
                const currentX = Math.cos(currentAngle) * baseR
                const currentZ = Math.sin(currentAngle) * baseR
                const currentVertex = [currentX, 0, currentZ]

                if (!opened) {
                    vertices.push(...currentVertex)
                    normals.push(0, -1, 0)

                    const currentVertIndex = vertexIndex++

                    if (v > 0) {
                        indices.push(baseCenterIndex, lastBaseCircumferenceIndex, currentVertIndex)
                    }

                    lastBaseCircumferenceIndex = currentVertIndex
                }
                
                if (v < density) {
                    const nextAngle = (v + 1) * angleStep;
                    const nextX = Math.cos(nextAngle) * baseR
                    const nextZ = Math.sin(nextAngle) * baseR
                    const nextVertex = [nextX, 0, nextZ]

                    vertices.push(...topVertex, ...currentVertex, ...nextVertex)
                    indices.push(vertexIndex++, vertexIndex++, vertexIndex++)

                    let crossVecs = []

                    crossVecs[invertNormals ? 0 : 1] = VecUtils.subtract(nextVertex, currentVertex)
                    crossVecs[invertNormals ? 1 : 0] = VecUtils.subtract(topVertex, currentVertex)

                    const faceNormal = VecUtils.cross(...crossVecs)
                    
                    normals.push(...faceNormal)
                    normals.push(...faceNormal)
                    normals.push(...faceNormal)
                }
            }

            return { vertices, normals, indices }
        })
    }
}

export default Cone;
