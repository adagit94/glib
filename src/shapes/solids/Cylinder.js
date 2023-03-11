import Shape from "../Shape.js";

class Cylinder extends Shape {
    constructor(ctx, r, height, density, optionals) {
        super(ctx, optionals?.uniforms, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = angle !== Math.PI * 2
            const topSideOpened = partialAngle || optionals?.opened === "both" || optionals?.opened === "top"
            const bottomSideOpened = partialAngle || optionals?.opened === "both" || optionals?.opened === "bottom"
            const invertNormals = instance.invertNormals = !!optionals?.invertNormals

            const cylinderAngleStep = angle / density
            const cylinderNormalPolarity = invertNormals ? -1 : 1
            const topSideNormal = [0, invertNormals ? -1 : 1, 0]
            const bottomSideNormal = [0, invertNormals ? 1 : -1, 0]
            const h = height / 2

            let vertices = [], normals = [], indices = []
            let topSideCenterIndex;
            let lastTopSideIndex
            let bottomSideCenterIndex;
            let lastBottomSideIndex;
            let lastRectPlateIndex
            let vertexIndex = 0;
            
            if (!topSideOpened) {
                vertices.push(0, h, 0)
                normals.push(...topSideNormal)
                topSideCenterIndex = vertexIndex++
            }

            if (!bottomSideOpened) {
                vertices.push(0, -h, 0)
                normals.push(...bottomSideNormal)
                bottomSideCenterIndex = vertexIndex++
            }
        
            for (let v = 0; v <= density; v++) {
                const currentVertAngle = v * cylinderAngleStep;
                const currentCos = Math.cos(currentVertAngle)
                const currentSin = Math.sin(currentVertAngle)
                const currentVertX = currentCos * r
                const currentVertZ = currentSin * r

                const currentTopVertCoords = [currentVertX, h, currentVertZ]
                const currentBottomVertCoords = [currentVertX, -h, currentVertZ]
                
                if (!topSideOpened) {
                    let currentIndex = vertexIndex++
                    
                    vertices.push(...currentTopVertCoords)
                    normals.push(...topSideNormal)
                    if (v > 0) indices.push(topSideCenterIndex, lastTopSideIndex, currentIndex)

                    lastTopSideIndex = currentIndex
                }

                if (!bottomSideOpened) {
                    let currentIndex = vertexIndex++
                    
                    vertices.push(...currentBottomVertCoords)
                    normals.push(...bottomSideNormal)
                    if (v > 0) indices.push(bottomSideCenterIndex, lastBottomSideIndex, currentIndex)

                    lastBottomSideIndex = currentIndex
                }

                const rectPlateNormal = [currentCos * cylinderNormalPolarity, 0, currentSin * cylinderNormalPolarity]
                const currentRectPlateIndex = vertexIndex
                
                vertices.push(...currentTopVertCoords, ...currentBottomVertCoords)
                normals.push(...rectPlateNormal, ...rectPlateNormal)
                
                if (v > 0) {
                    indices.push(lastRectPlateIndex, currentRectPlateIndex, lastRectPlateIndex + 1)
                    indices.push(lastRectPlateIndex + 1, currentRectPlateIndex + 1, currentRectPlateIndex)
                }

                lastRectPlateIndex = currentRectPlateIndex
                vertexIndex += 2
            }

            return { vertices, normals, indices }
        })
    }
}

export default Cylinder;
