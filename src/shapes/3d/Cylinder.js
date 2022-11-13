import Shape from "../Shape.js";

class Cylinder extends Shape {
    constructor(name, ctx, r, height, density) {
        super(name, ctx, () => {
            let cylinderVertices = [], cylinderNormals = []
            let topBaseVertices = [], topBaseNormals = []
            let bottomBaseVertices = [], bottomBaseNormals = []
            
            const angleStep = Math.PI * 2 / density

            topBaseVertices.push(0, height / 2, 0)
            topBaseNormals.push(0, 1, 0)
            bottomBaseVertices.push(0, -height / 2, 0)
            bottomBaseNormals.push(0, -1, 0)
            
            for (let v = 0; v <= density; v++) {
                const angle = v * angleStep;
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)
                const x = cos * r
                const z = sin * r

                const topCoords = [x, height / 2, z]
                const bottomCoords = [x, -height / 2, z]
                
                topBaseVertices.push(...topCoords)
                topBaseNormals.push(0, 1, 0)

                bottomBaseVertices.push(...bottomCoords)
                bottomBaseNormals.push(0, -1, 0)

                cylinderVertices.push(...topCoords)
                cylinderNormals.push(cos, 0, sin)
                cylinderVertices.push(...bottomCoords)
                cylinderNormals.push(cos, 0, sin)
            }

            return { vertices: [...cylinderVertices, ...topBaseVertices, ...bottomBaseVertices], normals: [...cylinderNormals, ...topBaseNormals, ...bottomBaseNormals] }
        })

        this.density = density
    }

    density

    render = () => {
        const cylinderVertices = (this.density + 1) * 2
        const baseVertices = this.density + 2
        
        this.drawArrays(this.gl.TRIANGLE_STRIP, { count: cylinderVertices})
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices, count: baseVertices })
        this.drawArrays(this.gl.TRIANGLE_FAN, { offset: cylinderVertices + baseVertices, count: baseVertices })
    }
}

export default Cylinder;
