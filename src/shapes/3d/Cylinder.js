import Shape from "../Shape.js";

class Cylinder extends Shape {
    static #INNER_CYLINDER_SCALE = 0.95
    
    constructor(name, ctx, r, height, density, optionals) {
        super(name, ctx, (instance) => {
            const angle = optionals?.angle ?? Math.PI * 2
            const partialAngle = instance.partialAngle = angle !== Math.PI * 2
            const sidesOpened = instance.sidesOpened = partialAngle || !!optionals?.sidesOpened
            const invertNormals = !sidesOpened && !!optionals?.invertNormals
            const cylinderAngleDensity = partialAngle ? Math.round(density * (angle / (Math.PI * 2))) : density
            const cylinderAngleStep = angle / cylinderAngleDensity
            
            let cylinderVertices = [], cylinderNormals = []
            let sidesVertices = [], sidesNormals = []
            
            let topSidesVertices = [], topSidesNormals = []
            let bottomSidesVertices = [], bottomSidesNormals = []

            ;(function initData(r, invertNormals) {
                const cylinderNormalPolarity = invertNormals ? -1 : 1
                const topSideNormal = [0, !sidesOpened && invertNormals ? -1 : 1, 0]
                const bottomSideNormal = [0, !sidesOpened && invertNormals ? 1 : -1, 0]
                
                if (!sidesOpened) {
                    topSidesVertices.push(0, height / 2, 0)
                    topSidesNormals.push(...topSideNormal)

                    bottomSidesVertices.push(0, -height / 2, 0)
                    bottomSidesNormals.push(...bottomSideNormal)
                }
            
                for (let v = 0; v <= density; v++) {
                    const angle = v * cylinderAngleStep;
                    const cos = Math.cos(angle)
                    const sin = Math.sin(angle)
                    const x = cos * r
                    const z = sin * r

                    const topCoords = [x, height / 2, z]
                    const bottomCoords = [x, -height / 2, z]
                    
                    topSidesVertices.push(...topCoords)
                    topSidesNormals.push(...topSideNormal)

                    bottomSidesVertices.push(...bottomCoords)
                    bottomSidesNormals.push(...bottomSideNormal)

                    cylinderVertices.push(...topCoords)
                    cylinderNormals.push(cos * cylinderNormalPolarity, 0, sin * cylinderNormalPolarity)

                    cylinderVertices.push(...bottomCoords)
                    cylinderNormals.push(cos * cylinderNormalPolarity, 0, sin * cylinderNormalPolarity)
                }

                if (sidesOpened && !invertNormals) initData(r * Cylinder.#INNER_CYLINDER_SCALE, true) 
            })(r, invertNormals)

            sidesVertices.push(...topSidesVertices)
            sidesNormals.push(...topSidesNormals)

            sidesVertices.push(...bottomSidesVertices)
            sidesNormals.push(...bottomSidesNormals)

            return { vertices: [...cylinderVertices, ...sidesVertices], normals: [...cylinderNormals, ...sidesNormals] }
        })

        this.density = density
    }

    density

    render = () => {
        const cylinderVertices = (this.density + 1) * 2
        const sideVertices = this.density + 2
        
        this.drawArrays(this.gl.TRIANGLE_STRIP, { count: cylinderVertices})
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices, count: sideVertices })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices + sideVertices, count: sideVertices })
    }
}

export default Cylinder;
