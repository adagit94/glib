import Shape from "../Shape.js";

class Cylinder extends Shape {
    static #INNER_CYLINDER_SCALE = 0.95
    static #OPENED_SIDES_OPTIONS = ["top", "bottom", "both"]
    
    constructor(name, ctx, r, height, density, optionals) {
        super(name, ctx, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const openedSides = instance.openedSides = !!optionals?.openedSides && Cylinder.#OPENED_SIDES_OPTIONS.includes(optionals.openedSides)
            const topSideOpened = openedSides === "both" || openedSides === "top"
            const bottomSideOpened = openedSides === "both" || openedSides === "bottom"
            const cylinderOpened = openedSides || partialAngle
            const invertNormals = !cylinderOpened && !!optionals?.invertNormals
            const cylinderAngleDensity = partialAngle ? Math.round(density * (angle / (Math.PI * 2))) : density
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

                if (openedSides && !invertNormals) initData(r * Cylinder.#INNER_CYLINDER_SCALE, true) 
            })(r, invertNormals)

            if (openedSides) {
                const offset = (cylinderAngleDensity + 1) * 4
                
                for (let i = 0; i <= cylinderAngleDensity; i++) {
                    const triStripOuterIndex = offset + i
                    const triStripInnerIndex = triStripOuterIndex + cylinderAngleDensity + 1

                    sidesIndices.push(triStripOuterIndex)
                    sidesIndices.push(triStripInnerIndex)
                }
            }

            sidesVertices.push(...topSidesVertices)
            sidesNormals.push(...topSidesNormals)

            sidesVertices.push(...bottomSidesVertices)
            sidesNormals.push(...bottomSidesNormals)

            return { vertices: [...cylinderVertices, ...sidesVertices], normals: [...cylinderNormals, ...sidesNormals], indices: sidesIndices }
        })
    }

    render = () => {
        const cylinderVertices = (this.density + 1) * 2
        const sideVertices = this.density + 2
        
        this.drawArrays(this.gl.TRIANGLE_STRIP, { count: cylinderVertices})
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices, count: sideVertices })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices + sideVertices, count: sideVertices })
    }
}

export default Cylinder;
