import VecUtils from "../../utils/VecUtils.js";
import Shape from "../Shape.js";

class Sphere extends Shape {
    constructor(name, ctx, r, stacks, sectors) {
        super(name, ctx, () => {
            let vertices = [], indices = [], normals = []
            
            const stackAngleStep = Math.PI / stacks
            const sectorAngleStep = Math.PI * 2 / sectors
            const rangeInv = 1 / r

            for (let stack = 0; stack <= stacks; stack++) {
                const stackAngle = Math.PI / 2 - stackAngleStep * stack
                const xy = Math.cos(stackAngle) * r
                const z = Math.sin(stackAngle) * r

                for (let sector = 0; sector <= sectors; sector++) {
                    const sectorAngle = sectorAngleStep * sector
                    const x = xy * Math.cos(sectorAngle)
                    const y = xy * Math.sin(sectorAngle)

                    vertices.push(x)
                    vertices.push(y)
                    vertices.push(z)

                    normals.push(x * rangeInv)
                    normals.push(y * rangeInv)
                    normals.push(z * rangeInv)
                }
            }

            const sectorsPerStack = sectors + 1
            
            for (let stack = 0; stack < stacks; stack++) {
                let i1 = stack * sectorsPerStack
                let i2 = i1 + sectorsPerStack

                for (let sector = 0; sector < sectors; sector++, i1++, i2++) {
                    if (stack > 0) {
                        indices.push(i1)
                        indices.push(i2)
                        indices.push(i1 + 1)
                    }

                    if (stack < stacks - 1) {
                        indices.push(i1 + 1)
                        indices.push(i2)
                        indices.push(i2 + 1)
                    }
                }
            }

            return { vertices, indices, normals }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Sphere