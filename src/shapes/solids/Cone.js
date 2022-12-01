import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js.js";

class Cone extends Shape {
    constructor(name, ctx, baseR, height, density, optionals) {
        super(name, ctx, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const opened = instance.opened = partialAngle || !!optionals?.opened
            const innerLayer = instance.innerLayer = (!partialAngle && opened && !!optionals?.innerLayer) || (partialAngle && !!optionals?.innerLayer)
            const invertNormals = !innerLayer && !!optionals?.invertNormals
            const coneAngleDensity = partialAngle && innerLayer ? Math.round(density * (angle / (Math.PI * 2))) : density
            const angleStep = angle / coneAngleDensity

            instance.coneCount = coneAngleDensity * 3
            instance.baseCount = opened ? innerLayer ? 2 * (coneAngleDensity + 1) : 0 : coneAngleDensity + 2

            let coneVertices = [], coneNormals = []
            let coneOpenedSidesVertices = [], coneOpenedSidesNormals = [], coneOpenedSidesIndices = []
            let baseVertices = [], baseNormals = [], baseIndices = []
            
            ;(function initData(baseR, height, invertNormals) {
                const topVertex = [0, height, 0]
                const baseNy = invertNormals ? 1 : -1
                
                if (!opened) {
                    baseVertices.push(0, 0, 0)
                    baseNormals.push(0, baseNy, 0)
                }

                for (let v = 0; v <= coneAngleDensity; v++) {
                    const currentAngle = v * angleStep;
                    const currentX = Math.cos(currentAngle) * baseR
                    const currentZ = Math.sin(currentAngle) * baseR
                    const currentVertex = [currentX, 0, currentZ]

                    if (innerLayer || !opened) {
                        baseVertices.push(...currentVertex)
                        baseNormals.push(0, opened ? -1 : baseNy, 0)
                    }
                    
                    if (v < coneAngleDensity) {
                        const nextAngle = (v + 1) * angleStep;
                        const nextX = Math.cos(nextAngle) * baseR
                        const nextZ = Math.sin(nextAngle) * baseR
                        const nextVertex = [nextX, 0, nextZ]

                        coneVertices.push(...topVertex)
                        coneVertices.push(...currentVertex)
                        coneVertices.push(...nextVertex)

                        let crossVecs = []

                        crossVecs[invertNormals ? 0 : 1] = VecUtils.subtract(nextVertex, currentVertex)
                        crossVecs[invertNormals ? 1 : 0] = VecUtils.subtract(topVertex, currentVertex)

                        const faceNormal = VecUtils.cross(...crossVecs)
                        
                        coneNormals.push(...faceNormal)
                        coneNormals.push(...faceNormal)
                        coneNormals.push(...faceNormal)
                    }
                }

                if (innerLayer && !invertNormals) initData(baseR * optionals.innerScale, height * optionals.innerScale, true)
            })(baseR, height, invertNormals)

            if (innerLayer) {
                const offset = instance.coneCount * 2

                for (let i = 0; i < coneAngleDensity; i++) {
                    const firstIndex = offset + i
                    const outerConeIndex = firstIndex
                    const innerConeIndex = firstIndex + coneAngleDensity + 1

                    baseIndices.push(outerConeIndex, outerConeIndex + 1, innerConeIndex)
                    baseIndices.push(outerConeIndex + 1, innerConeIndex + 1, innerConeIndex)
                }

                if (partialAngle) {
                    const outerConeR = baseR + (-baseR / height) * (height * optionals.innerScale)

                    const outerConeBottomStartVertex = [Math.cos(0) * baseR, 0, Math.sin(0) * baseR]
                    const outerConeTopStartVertex = [Math.cos(0) * outerConeR, height * optionals.innerScale, Math.sin(0) * outerConeR]
                    const innerConeBottomStartVertex = [Math.cos(0) * (baseR * optionals.innerScale), 0, Math.sin(0) * (baseR * optionals.innerScale)]
                    const innerConeTopVertex = [0, height * optionals.innerScale, 0]

                    coneOpenedSidesVertices.push(...outerConeBottomStartVertex)
                    coneOpenedSidesVertices.push(...outerConeTopStartVertex)
                    coneOpenedSidesVertices.push(...innerConeBottomStartVertex)
                    coneOpenedSidesVertices.push(...innerConeTopVertex)

                    const startSideNormal = VecUtils.cross(VecUtils.subtract(innerConeBottomStartVertex, outerConeBottomStartVertex), VecUtils.subtract(outerConeTopStartVertex, outerConeBottomStartVertex))
                    
                    coneOpenedSidesNormals.push(...startSideNormal)
                    coneOpenedSidesNormals.push(...startSideNormal)
                    coneOpenedSidesNormals.push(...startSideNormal)
                    coneOpenedSidesNormals.push(...startSideNormal)

                    const startFirstIndex = instance.coneCount * 2 + (coneAngleDensity + 1) * 2

                    coneOpenedSidesIndices.push(startFirstIndex, startFirstIndex + 1, startFirstIndex + 2)
                    coneOpenedSidesIndices.push(startFirstIndex + 2, startFirstIndex + 3, startFirstIndex + 1)

                    const outerConeBottomFinishVertex = [Math.cos(angle) * baseR, 0, Math.sin(angle) * baseR]
                    const outerConeTopFinishVertex = [Math.cos(angle) * outerConeR, height * optionals.innerScale, Math.sin(angle) * outerConeR]
                    const innerConeBottomFinishVertex = [Math.cos(angle) * (baseR * optionals.innerScale), 0, Math.sin(angle) * (baseR * optionals.innerScale)]

                    coneOpenedSidesVertices.push(...outerConeBottomFinishVertex)
                    coneOpenedSidesVertices.push(...outerConeTopFinishVertex)
                    coneOpenedSidesVertices.push(...innerConeBottomFinishVertex)
                    coneOpenedSidesVertices.push(...innerConeTopVertex)

                    const finishSideNormal = VecUtils.cross(VecUtils.subtract(outerConeTopFinishVertex, outerConeBottomFinishVertex), VecUtils.subtract(innerConeBottomFinishVertex, outerConeBottomFinishVertex))
                    
                    coneOpenedSidesNormals.push(...finishSideNormal)
                    coneOpenedSidesNormals.push(...finishSideNormal)
                    coneOpenedSidesNormals.push(...finishSideNormal)
                    coneOpenedSidesNormals.push(...finishSideNormal)

                    const finishFirstIndex = startFirstIndex + 4

                    instance.apexOffset = finishFirstIndex + 4
                    
                    coneOpenedSidesIndices.push(finishFirstIndex, finishFirstIndex + 1, finishFirstIndex + 2)
                    coneOpenedSidesIndices.push(finishFirstIndex + 2, finishFirstIndex + 3, finishFirstIndex + 1)

                    const openedAngleDensity = density - coneAngleDensity
                    const topTriFanAngleStep = (Math.PI * 2 - angle) / openedAngleDensity
                    const outerConeTopVertex = [0, height, 0]

                    instance.apexBaseCount = openedAngleDensity + 2
                    instance.apexCount = openedAngleDensity * 3

                    let apexBaseVertices = []
                    let apexBaseNormals = []

                    let apexVertices = []
                    let apexNormals = []
                    
                    const apexBaseNormal = VecUtils.cross(VecUtils.subtract(innerConeTopVertex, outerConeTopStartVertex), VecUtils.subtract(outerConeTopFinishVertex, outerConeTopStartVertex))
                    
                    apexBaseVertices.push(...innerConeTopVertex)
                    apexBaseNormals.push(...apexBaseNormal)

                    for (let v = 0; v <= openedAngleDensity; v++) {
                        const currentVertexAngle = angle + v * topTriFanAngleStep
                        const currentVertexCos = Math.cos(currentVertexAngle)
                        const currentVertexSin = Math.sin(currentVertexAngle)

                        const apexCurrentVertex = [currentVertexCos * outerConeR, height * optionals.innerScale, currentVertexSin * outerConeR]
                        
                        apexBaseVertices.push(...apexCurrentVertex)
                        apexBaseNormals.push(...apexBaseNormal)
                        
                        if (v < openedAngleDensity) {
                            const nextVertexAngle = angle + (v + 1) * topTriFanAngleStep
                            const nextVertexCos = Math.cos(nextVertexAngle)
                            const nextVertexSin = Math.sin(nextVertexAngle)
                            
                            const apexNextVertex = [nextVertexCos * outerConeR, height * optionals.innerScale, nextVertexSin * outerConeR]
                            const apexFaceNormal = VecUtils.cross(VecUtils.subtract(outerConeTopVertex, apexCurrentVertex), VecUtils.subtract(apexNextVertex, apexCurrentVertex))

                            apexVertices.push(...apexCurrentVertex)
                            apexVertices.push(...apexNextVertex)
                            apexVertices.push(...outerConeTopVertex)

                            apexNormals.push(...apexFaceNormal)
                            apexNormals.push(...apexFaceNormal)
                            apexNormals.push(...apexFaceNormal)
                        }
                    }

                    coneOpenedSidesVertices.push(...apexBaseVertices)
                    coneOpenedSidesNormals.push(...apexBaseNormals)
                    
                    coneOpenedSidesVertices.push(...apexVertices)
                    coneOpenedSidesNormals.push(...apexNormals)
                }
            }

            return { vertices: [...coneVertices, ...baseVertices, ...coneOpenedSidesVertices], normals: [...coneNormals, ...baseNormals, ...coneOpenedSidesNormals], indices: [...baseIndices, ...coneOpenedSidesIndices] }
        })
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES, { count: this.coneCount })

        if (this.opened) {
            if (this.innerLayer) {
                this.drawArrays(this.gl.TRIANGLES, { count: this.coneCount, offset: this.coneCount })
                this.drawElements(this.gl.TRIANGLES)
                
                if (this.partialAngle) {
                    this.drawArrays(this.gl.TRIANGLE_FAN, { offset: this.apexOffset, count: this.apexBaseCount })
                    this.drawArrays(this.gl.TRIANGLES, { offset: this.apexOffset + this.apexBaseCount, count: this.apexCount })
                }
            }
        } else {
            this.drawArrays(this.gl.TRIANGLE_FAN, { offset: this.coneCount, count: this.baseCount })
        }
    }
}

export default Cone;
