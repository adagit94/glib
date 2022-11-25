import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Cylinder extends Shape {
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
            let openedEdgesVertices = [], openedEdgesNormals = [], openedEdgesIndices = []
            
            let topSidesVertices = [], topSidesNormals = []
            let bottomSidesVertices = [], bottomSidesNormals = []

            ;(function initData(r, invertNormals) {
                const cylinderNormalPolarity = invertNormals ? -1 : 1
                const topSideNormal = [0, topSideOpened || !invertNormals ? 1 : -1, 0]
                const bottomSideNormal = [0, bottomSideOpened || !invertNormals ? -1 : 1, 0]
                let h = height / 2
                
                if (!topSideOpened) {
                    if (bottomSideOpened && invertNormals) h *= optionals.innerScale
                    
                    topSidesVertices.push(0, h, 0)
                    topSidesNormals.push(...topSideNormal)
                }

                if (!bottomSideOpened) {
                    if (topSideOpened && invertNormals) h *= optionals.innerScale

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

                if (opened && !invertNormals) initData(r * optionals.innerScale, true) 
            })(r, invertNormals)

            if (opened) {
                let offset = (cylinderAngleDensity + 1) * 4

                ;(function setSideIndices(sideOpened, recurse) {
                    if (sideOpened) {
                        for (let i = 0; i < cylinderAngleDensity; i++) {
                            const triStripOuterIndex = offset + i
                            const triStripInnerIndex = triStripOuterIndex + cylinderAngleDensity + 1

                            sidesIndices.push(triStripOuterIndex, triStripOuterIndex + 1, triStripInnerIndex)
                            sidesIndices.push(triStripOuterIndex + 1, triStripInnerIndex + 1, triStripInnerIndex)
                        }
                    }

                    if (recurse && bottomSideOpened) {
                        offset += 2 * (cylinderAngleDensity + 1)

                        if (!topSideOpened) {
                            offset += 2
                        }
                        
                        setSideIndices(true, false)
                    }
                })(topSideOpened, true)

                if (partialAngle) {
                    offset += 2 * (cylinderAngleDensity + 1)
                    
                    ;(function setOpenedEdgesData(a, recurse = true) {
                        const topOuter = [Math.cos(a) * r, height / 2, Math.sin(a) * r]
                        const topInner = [Math.cos(a) * (r * optionals.innerScale), height / 2, Math.sin(a) * (r * optionals.innerScale)]
                        const bottomOuter = [Math.cos(a) * r, -height / 2, Math.sin(a) * r]
                        const bottomInner = [Math.cos(a) * (r * optionals.innerScale), -height / 2, Math.sin(a) * (r * optionals.innerScale)]
    
                        const normal = a === 0 ? VecUtils.cross(VecUtils.subtract(bottomOuter, topOuter), VecUtils.subtract(topInner, topOuter)) : VecUtils.cross(VecUtils.subtract(topInner, topOuter), VecUtils.subtract(bottomOuter, topOuter))
    
                        openedEdgesVertices.push(...topOuter)
                        openedEdgesVertices.push(...topInner)
                        openedEdgesVertices.push(...bottomOuter)
                        openedEdgesVertices.push(...bottomInner)
    
                        openedEdgesNormals.push(...normal)
                        openedEdgesNormals.push(...normal)
                        openedEdgesNormals.push(...normal)
                        openedEdgesNormals.push(...normal)
    
                        openedEdgesIndices.push(offset, offset + 1, offset + 2)
                        openedEdgesIndices.push(offset + 1, offset + 2, offset + 3)  

                        if (recurse) {
                            offset += 4
                            setOpenedEdgesData(angle, false)
                        }
                    })(0);
                }
            }

            sidesVertices.push(...topSidesVertices)
            sidesNormals.push(...topSidesNormals)

            sidesVertices.push(...bottomSidesVertices)
            sidesNormals.push(...bottomSidesNormals)

            return { vertices: [...cylinderVertices, ...sidesVertices, ...openedEdgesVertices], normals: [...cylinderNormals, ...sidesNormals, ...openedEdgesNormals], indices: [...sidesIndices, ...openedEdgesIndices] }
        })
    }

    render = () => {
        const cylinderCount = (this.cylinderAngleDensity + 1) * 4
        const triStripCount = (this.cylinderAngleDensity + 1) * 2
        const triFanCount = this.cylinderAngleDensity + 2
        
        this.drawArrays(this.gl.TRIANGLE_STRIP, { count: triStripCount })
        
        if (this.opened) {
            this.drawArrays(this.gl.TRIANGLE_STRIP, { count: triStripCount, offset: triStripCount })

            if (this.topSideOpened || this.bottomSideOpened) {
                this.drawElements(this.gl.TRIANGLES)
            }

            if (!this.topSideOpened) {
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderCount, count: triFanCount })
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderCount + triFanCount, count: triFanCount })
            }
            
            if (!this.bottomSideOpened) {
                let offset = cylinderCount + triStripCount

                if (!this.topSideOpened) {
                    offset += 2
                }
                
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset, count: triFanCount })
                this.drawArrays(this.gl.TRIANGLE_FAN, { offset: offset + triFanCount, count: triFanCount })
            }
        } else {
            this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triStripCount, count: triFanCount })
            this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triStripCount + triFanCount, count: triFanCount })
        }
    }
}

export default Cylinder;
