import Shape from "../Shape.js";

class Cone extends Shape {
    constructor(name, ctx, baseR, height, density, optionals) {
        super(name, ctx, () => {
            const withoutBase = !!optionals?.withoutBase
            const invertNormals = !!optionals?.invertNormals
            
            let coneVertices = [], coneNormals = []
            let baseVertices = [], baseNormals = []
            
            const slopeAngle = Math.atan(baseR / height)
            const angleStep = Math.PI * 2 / density

            const coneNy = invertNormals ? -1 : 1
            const baseNy = invertNormals ? 1 : -1
            
            coneVertices.push(0, height, 0)
            coneNormals.push(0, coneNy, 0)

            baseVertices.push(0, 0, 0)
            baseNormals.push(0, baseNy, 0)
            
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

                baseVertices.push(...vCoords)
                baseNormals.push(0, baseNy, 0)
            }

            return { vertices: [...coneVertices, ...baseVertices], normals: [...coneNormals, ...baseNormals] }
        })
    }

    render = () => {
        const halfCount = this.geometryData.vertices.length / 2 / 3

        this.drawArrays(this.gl.TRIANGLE_FAN, { count: halfCount })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: halfCount, count: halfCount })
    }
}

export default Cone;
