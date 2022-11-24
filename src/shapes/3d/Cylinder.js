import Shape from "../Shape.js";

class Cylinder extends Shape {
    static #INNER_CYLINDER_SCALE = 0.95
    
    constructor(name, ctx, r, height, density, optionals) {
        super(name, ctx, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const topSideOpened = instance.topSideOpened = partialAngle || optionals?.opened === "both" || optionals?.opened === "top"
            const bottomSideOpened = instance.bottomSideOpened = partialAngle || optionals?.opened === "both" || optionals?.opened === "bottom"
            const opened = instance.opened = topSideOpened || bottomSideOpened
            const invertNormals = !opened && !!optionals?.invertNormals
            const cylinderAngleDensity = instance.cylinderAngleDensity = density
            const cylinderAngleStep = angle / cylinderAngleDensity
            
            let cylinderVertices = [], cylinderNormals = []
            let sidesVertices = [], sidesNormals = [], sidesIndices = []
            
            let topSidesVertices = [], topSidesNormals = []
            let bottomSidesVertices = [], bottomSidesNormals = []

            ;(function initData(r, invertNormals) {
                const cylinderNormalPolarity = invertNormals ? -1 : 1
                const topSideNormal = [0, topSideOpened || !invertNormals ? 1 : -1, 0]
                const bottomSideNormal = [0, bottomSideOpened || !invertNormals ? -1 : 1, 0]
                let h = height / 2
                
                if (!topSideOpened) {
                    if (bottomSideOpened && invertNormals) h *= Cylinder.#INNER_CYLINDER_SCALE
                    
                    topSidesVertices.push(0, h, 0)
                    topSidesNormals.push(...topSideNormal)
                }

                if (!bottomSideOpened) {
                    if (topSideOpened && invertNormals) h *= Cylinder.#INNER_CYLINDER_SCALE

                    bottomSidesVertices.push(0, -h, 0)
                    bottomSidesNormals.push(...bottomSideNormal)
                }
            
                for (let v = 0; v <= cylinderAngleDensity; v++) {
                    const angle = v * cylinderAngleStep;
                    const cos = Math.cos(angle)
                    const sin = Math.sin(angle)
                    const x = cos * r
                    const z = sin * r

                    const topCoords = [x, h, z]
                    const bottomCoords = [x, -h, z]
                    
                    topSidesVertices.push(...topCoords)
                    topSidesNormals.push(...topSideNormal)

                    bottomSidesVertices.push(...bottomCoords)
                    bottomSidesNormals.push(...bottomSideNormal)

                    cylinderVertices.push(...topCoords)
                    cylinderNormals.push(cos * cylinderNormalPolarity, 0, sin * cylinderNormalPolarity)

                    cylinderVertices.push(...bottomCoords)
                    cylinderNormals.push(cos * cylinderNormalPolarity, 0, sin * cylinderNormalPolarity)
                }

                if (opened && !invertNormals) initData(r * Cylinder.#INNER_CYLINDER_SCALE, true) 
            })(r, invertNormals)

            if (opened) {
                let offset = (cylinderAngleDensity + 1) * 4

                ;(function setSideIndices(offset, recurse) {
                    if (topSideOpened) {
                        for (let i = 0; i <= cylinderAngleDensity; i++) {
                            const triStripOuterIndex = offset + i
                            const triStripInnerIndex = triStripOuterIndex + cylinderAngleDensity + 1

                            sidesIndices.push(triStripOuterIndex)
                            sidesIndices.push(triStripInnerIndex)
                        }
                    }

                    if (recurse && bottomSideOpened) {
                        offset += 2 * (cylinderAngleDensity + 1)

                        if (!topSideOpened) {
                            offset += 2
                        }
                        
                        setSideIndices(offset, false)
                    }
                })(offset, true)
            }

            sidesVertices.push(...topSidesVertices)
            sidesNormals.push(...topSidesNormals)

            sidesVertices.push(...bottomSidesVertices)
            sidesNormals.push(...bottomSidesNormals)

            return { vertices: [...cylinderVertices, ...sidesVertices], normals: [...cylinderNormals, ...sidesNormals], indices: sidesIndices }
        })
    }

    render = () => {
        const triStripCount = (this.cylinderAngleDensity + 1) * 2
        const triFanCount = this.cylinderAngleDensity + 2
        
        this.drawArrays(this.gl.TRIANGLE_STRIP, { count: triStripCount})
        
        if (this.opened) {
            this.drawArrays(this.gl.TRIANGLE_STRIP, { count: triStripCount, offset: triStripCount})

            if (this.topSideOpened) {
                this.drawElements(this.gl.TRIANGLE_STRIP, { count: triStripCount })
            } else {
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triStripCount * 2, count: triFanCount })
            }

            if (this.bottomSideOpened) {
                this.drawElements(this.gl.TRIANGLE_STRIP, { count: triStripCount, offset: this.topSideOpened ? triStripCount : 0})
            } else {
                let offset = triStripCount * 2

                if (!this.topSideOpened) {
                    offset += 2
                }
                
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset, count: triFanCount })
            }
        } else {
            this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triStripCount, count: triFanCount })
            this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triStripCount + triFanCount, count: triFanCount })
        }

        
    }
}

export default Cylinder;
