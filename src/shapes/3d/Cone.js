import Shape from "../Shape.js";

class Cone extends Shape {
    constructor(name, ctx, baseR, height, density) {
        super(name, ctx, () => {
            let vertices = [], normals = []
            
            const angleStep = Math.PI * 2 / density

            for (let v = 0; v < density; v++) {
                const angle = v * angleStep;
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)
                const normal = [cos, 1, sin * -1]
                
                // top triangle vertex
                vertices.push(0, height, 0)
                normals.push(...normal)
                
                // first bottom triangle vertex
                vertices.push(cos * baseR, 0, sin * baseR)
                normals.push(...normal)
                
                // second bottom triangle vertex
                {
                    const angle = (v + 1) * angleStep;
                    const cos = Math.cos(angle)
                    const sin = Math.sin(angle)

                    vertices.push(cos * baseR, 0, sin * baseR)
                    normals.push(...normal)
                }
            }

            return { vertices, normals }
        })
    }

    render = () => {
        this.drawArrays(this.gl.TRIANGLES)
    }
}

export default Cone;
