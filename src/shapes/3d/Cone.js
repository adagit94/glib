import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Cone extends Shape {
    static #INNER_CONE_SCALE = 0.95
    
    constructor(name, ctx, baseR, height, density, optionals) {
        super(name, ctx, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const baseOpened = instance.baseOpened = partialAngle || !!optionals?.baseOpened
            const invertNormals = !baseOpened && !!optionals?.invertNormals
            const coneAngleDensity = instance.coneAngleDensity = partialAngle ? Math.round(density * (angle / (Math.PI * 2))) : density
            const angleStep = angle / coneAngleDensity

            let coneVertices = [], coneNormals = []
            let coneOpenedSidesVertices = [], coneOpenedSidesNormals = [], coneOpenedSidesIndices = []
            let baseVertices = [], baseNormals = [], baseIndices = []
            
            ;(function initData(baseR, height, invertNormals) {
                const slopeAngle = Math.atan(baseR / height)

                const coneNy = invertNormals ? -1 : 1
                const baseNy = invertNormals ? 1 : -1
                
                coneVertices.push(0, height, 0)
                coneNormals.push(0, coneNy, 0)

                if (!baseOpened) {
                    baseVertices.push(0, 0, 0)
                    baseNormals.push(0, baseNy, 0)
                }
                
                for (let v = 0; v <= coneAngleDensity; v++) {
                    const angle = v * angleStep;
                    const cos = Math.cos(angle)
                    const sin = Math.sin(angle)

                    const vCoords = [cos * baseR, 0, sin * baseR]

                    let nx = cos * Math.cos(slopeAngle)
                    let ny = Math.sin(slopeAngle)
                    let nz = sin * Math.cos(slopeAngle)

                    if (invertNormals) {
                        nx *= -1
                        ny *= -1
                        nz *= -1
                    }
                    
                    coneVertices.push(...vCoords)
                    coneNormals.push(nx, ny, nz)

                    if (baseOpened) {
                        baseVertices.push(...vCoords)
                        baseNormals.push(0, -1, 0)
                    } else {
                        baseVertices.push(...vCoords)
                        baseNormals.push(0, baseNy, 0)
                    }
                }

                if (baseOpened && !invertNormals) initData(baseR * Cone.#INNER_CONE_SCALE, height * Cone.#INNER_CONE_SCALE, true)
            })(baseR, height, invertNormals)

            if (baseOpened) {
                const offset = (coneAngleDensity + 2) * 2

                for (let i = 0; i < coneAngleDensity; i++) {
                    const firstIndex = offset + i
                    const outerConeIndex = firstIndex
                    const innerConeIndex = firstIndex + coneAngleDensity + 1

                    baseIndices.push(outerConeIndex, outerConeIndex + 1, innerConeIndex)
                    baseIndices.push(outerConeIndex + 1, innerConeIndex + 1, innerConeIndex)
                }
            }

            if (partialAngle) {
                const outerConeR = baseR + (-baseR / height) * (height * Cone.#INNER_CONE_SCALE)

                const outerConeBottomStartVertex = [Math.cos(0) * baseR, 0, Math.sin(0) * baseR]
                const outerConeTopStartVertex = [Math.cos(0) * outerConeR, height * Cone.#INNER_CONE_SCALE, Math.sin(0) * outerConeR]
                const innerConeBottomStartVertex = [Math.cos(0) * (baseR * Cone.#INNER_CONE_SCALE), 0, Math.sin(0) * (baseR * Cone.#INNER_CONE_SCALE)]
                const innerConeTopVertex = [0, height * Cone.#INNER_CONE_SCALE, 0]

                coneOpenedSidesVertices.push(...outerConeBottomStartVertex)
                coneOpenedSidesVertices.push(...outerConeTopStartVertex)
                coneOpenedSidesVertices.push(...innerConeBottomStartVertex)
                coneOpenedSidesVertices.push(...innerConeTopVertex)

                const startSideNormal = VecUtils.cross(VecUtils.subtract(innerConeBottomStartVertex, outerConeBottomStartVertex), VecUtils.subtract(outerConeTopStartVertex, outerConeBottomStartVertex))
                
                coneOpenedSidesNormals.push(...startSideNormal)
                coneOpenedSidesNormals.push(...startSideNormal)
                coneOpenedSidesNormals.push(...startSideNormal)
                coneOpenedSidesNormals.push(...startSideNormal)

                const startFirstIndex = (coneAngleDensity + 2) * 2 + (coneAngleDensity + 1) * 2
                
                coneOpenedSidesIndices.push(startFirstIndex, startFirstIndex + 1, startFirstIndex + 2)
                coneOpenedSidesIndices.push(startFirstIndex + 2, startFirstIndex + 3, startFirstIndex + 1)

                const outerConeBottomFinishVertex = [Math.cos(angle) * baseR, 0, Math.sin(angle) * baseR]
                const outerConeTopFinishVertex = [Math.cos(angle) * outerConeR, height * Cone.#INNER_CONE_SCALE, Math.sin(angle) * outerConeR]
                const innerConeBottomFinishVertex = [Math.cos(angle) * (baseR * Cone.#INNER_CONE_SCALE), 0, Math.sin(angle) * (baseR * Cone.#INNER_CONE_SCALE)]

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
                
                coneOpenedSidesIndices.push(finishFirstIndex, finishFirstIndex + 1, finishFirstIndex + 2)
                coneOpenedSidesIndices.push(finishFirstIndex + 2, finishFirstIndex + 3, finishFirstIndex + 1)

                const openedAngleDensity = instance.openedAngleDensity = density - coneAngleDensity
                const topTriFanAngleStep = (Math.PI * 2 - angle) / openedAngleDensity
                const outerConeTopVertex = [0, height, 0]

                let apexBaseVertices = []
                let apexBaseNormals = []

                let apexVertices = []
                let apexNormals = []
                
                apexBaseVertices.push(...innerConeTopVertex)
                apexBaseNormals.push(0, -1, 0)

                apexVertices.push(...outerConeTopVertex)
                apexNormals.push(0, 1, 0)

                const slopeAngle = Math.atan(baseR / height)
                
                for (let v = 0; v <= openedAngleDensity; v++) {
                    const vertexAngle = angle + v * topTriFanAngleStep
                    const cos = Math.cos(vertexAngle)
                    const sin = Math.sin(vertexAngle)

                    const apexVertex = [cos * outerConeR, height * Cone.#INNER_CONE_SCALE, sin * outerConeR]
                    const apexNormal = [cos * Math.cos(slopeAngle), Math.sin(slopeAngle), sin * Math.cos(slopeAngle)]

                    apexVertices.push(...apexVertex)
                    apexNormals.push(...apexNormal)

                    const apexBaseNormal = VecUtils.cross(VecUtils.subtract(innerConeTopVertex, apexVertex), VecUtils.subtract(outerConeTopFinishVertex, apexVertex))
                    
                    apexBaseVertices.push(...apexVertex)
                    apexBaseNormals.push(...apexBaseNormal)
                }

                coneOpenedSidesVertices.push(...apexBaseVertices)
                coneOpenedSidesNormals.push(...apexBaseNormals)
                
                coneOpenedSidesVertices.push(...apexVertices)
                coneOpenedSidesNormals.push(...apexNormals)
            }

            return { vertices: [...coneVertices, ...baseVertices, ...coneOpenedSidesVertices], normals: [...coneNormals, ...baseNormals, ...coneOpenedSidesNormals], indices: [...baseIndices, ...coneOpenedSidesIndices] }
        })
    }

    render = () => {
        const triFanVertices = this.coneAngleDensity + 2

        this.drawArrays(this.gl.TRIANGLE_FAN, { count: triFanVertices })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triFanVertices, count: triFanVertices })

        if (this.baseOpened) {
            this.drawElements(this.gl.TRIANGLES)

            if (this.partialAngle) {
                const apexTriFanVertices = this.openedAngleDensity + 2
                const apexBaseOffset = (this.coneAngleDensity + 2) * 2 + (this.coneAngleDensity + 1) * 2 + 8
                const apexOffset = apexBaseOffset + apexTriFanVertices
                
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: apexBaseOffset, count: apexTriFanVertices })
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: apexOffset, count: apexTriFanVertices })
            }
        }
    }
}

export default Cone;
