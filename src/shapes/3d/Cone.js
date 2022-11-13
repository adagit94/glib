import Shape from "../Shape.js";

class Cone extends Shape {
    constructor(name, ctx, baseR, height, density) {
        super(name, ctx, () => {
            let coneVertices = [], coneNormals = []
            let baseVertices = [], baseNormals = []
            
            const slopeAngle = Math.atan(baseR / height)
            const angleStep = Math.PI * 2 / density

            coneVertices.push(0, height, 0)
            coneNormals.push(0, 1, 0)

            baseVertices.push(0, 0, 0)
            baseNormals.push(0, -1, 0)
            
            for (let v = 0; v <= density; v++) {
                const angle = v * angleStep;
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)
                const vCoords = [cos * baseR, 0, sin * baseR]
                
                coneVertices.push(...vCoords)
                coneNormals.push(cos * Math.cos(slopeAngle), Math.sin(slopeAngle), sin * Math.cos(slopeAngle))

                baseVertices.push(...vCoords)
                baseNormals.push(0, -1, 0)
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
