import Shape from "../Shape.js";

class Sphere extends Shape {
    constructor(ctx, radius, stacks, sectors, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const angle = optionals?.angle ?? Math.PI * 2
            const normalPolarity = optionals?.invertNormals ? -1 : 1
            
            const stackAngleStep = Math.PI / stacks
            const sectorAngleStep = angle / sectors
            const rangeInv = 1 / radius
            const stackOrigin = Math.PI / 2

            let vertices = [], indices = [], normals = []

            for (let stack = 0; stack <= stacks; stack++) {
                const stackAngle = stackOrigin - stackAngleStep * stack
                const xy = Math.cos(stackAngle) * radius
                const z = Math.sin(stackAngle) * radius

                for (let sector = 0; sector <= sectors; sector++) {
                    const sectorAngle = sectorAngleStep * sector
                    const x = xy * Math.cos(sectorAngle)
                    const y = xy * Math.sin(sectorAngle)

                    vertices.push(x)
                    vertices.push(z)
                    vertices.push(y)

                    normals.push(x * rangeInv * normalPolarity)
                    normals.push(z * rangeInv * normalPolarity)
                    normals.push(y * rangeInv * normalPolarity)
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
}

export default Sphere