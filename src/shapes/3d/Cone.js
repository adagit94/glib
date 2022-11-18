import Shape from "../Shape.js";

class Cone extends Shape {
    constructor(name, ctx, baseR, height, density, optionals) {
        super(name, ctx, () => {
            const opened = !!optionals?.opened
            const invertNormals = !opened && !!optionals?.invertNormals
            
            let coneVertices = [], coneNormals = []
            let baseVertices = [], baseNormals = [], baseIndices
            
            ;(function initData(baseR, height, invertNormals) {
                const slopeAngle = Math.atan(baseR / height)
                const angleStep = Math.PI * 2 / density

                const coneNy = invertNormals ? -1 : 1
                const baseNy = invertNormals ? 1 : -1
                
                coneVertices.push(0, height, 0)
                coneNormals.push(0, coneNy, 0)

                if (!opened) {
                    baseVertices.push(0, 0, 0)
                    baseNormals.push(0, baseNy, 0)
                }
                
                for (let v = 0; v <= density; v++) {
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

                    if (opened) {
                        baseVertices.push(...vCoords)
                        baseNormals.push(0, -1, 0)
                    } else {
                        baseVertices.push(...vCoords)
                        baseNormals.push(0, baseNy, 0)
                    }
                }

                if (opened && !invertNormals) initData(baseR * 0.95, height * 0.95, true)
            })(baseR, height, invertNormals)

            if (opened) {
                const offset = (density + 2) * 2

                baseIndices = []

                for (let i = 0; i < density; i++) {
                    const firstIndex = offset + i
                    const outerConeIndex = firstIndex
                    const innerConeIndex = firstIndex + density + 1

                    baseIndices.push(outerConeIndex, outerConeIndex + 1, innerConeIndex)
                    baseIndices.push(outerConeIndex + 1, innerConeIndex + 1, innerConeIndex)
                }
            }

            return { vertices: [...coneVertices, ...baseVertices], normals: [...coneNormals, ...baseNormals], indices: baseIndices }
        })

        this.#density = density
        this.#opened = !!optionals?.opened
    }

    #density
    #opened

    render = () => {
        const triFanVertices = this.#density + 2

        this.drawArrays(this.gl.TRIANGLE_FAN, { count: triFanVertices })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: triFanVertices, count: triFanVertices })

        if (this.#opened) {
            this.drawElements(this.gl.TRIANGLES)
        }
    }
}

export default Cone;
