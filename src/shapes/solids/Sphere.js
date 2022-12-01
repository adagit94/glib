import Shape from "../Shape.js";

class Sphere extends Shape {
    constructor(name, ctx, radius, stacks, sectors, optionals) {
        super(name, ctx, () => {
            const angle = optionals?.angle ?? Math.PI * 2
            const innerLayer = !!optionals?.innerLayer
            const invertNormals = !innerLayer && !!optionals?.invertNormals
            
            let vertices = [], indices = [], normals = []
            
            const stackAngleStep = Math.PI / stacks
            const sectorAngleStep = angle / sectors
            const rangeInv = 1 / radius
            const stackOrigin = Math.PI / 2

            ;(function setData(r, indicesOffset, normalPolarity) {
                for (let stack = 0; stack <= stacks; stack++) {
                    const stackAngle = stackOrigin - stackAngleStep * stack
                    const xy = Math.cos(stackAngle) * r
                    const z = Math.sin(stackAngle) * r

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
                    let i1 = indicesOffset + stack * sectorsPerStack
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

                if (innerLayer && normalPolarity === 1) {
                    let verticesOffset = (stacks + 1) * sectorsPerStack
                    
                    const innerRadius = radius * optionals.innerScale
                    
                    setData(innerRadius, verticesOffset, -1)

                    verticesOffset *= 2

                    const getVec = (sectorCos, sectorSin, stackAngle, r) => {
                        const stackCos = Math.cos(stackAngle)
                        const stackSin = Math.sin(stackAngle)

                        const xy = stackCos * r
                        const z = stackSin * r
                        const x = xy * sectorCos
                        const y = xy * sectorSin

                        return [x, z, y]
                    }
                    
                    ;(function setArcData(sectorAngle) {
                        const sectorCos = Math.cos(sectorAngle)
                        const sectorSin = Math.sin(sectorAngle)
                        
                        const normalAngle = sectorAngle === 0 ? sectorAngle - Math.PI / 2 : sectorAngle + Math.PI / 2
                        const normalCos = Math.cos(normalAngle)
                        const normalSin = Math.sin(normalAngle)
                        const normal = [normalCos, 0, normalSin]

                        for (let stack = 0; stack <= stacks; stack++) {
                            const stackAngle = stackOrigin - stackAngleStep * stack
                            const outerVec = getVec(sectorCos, sectorSin, stackAngle, radius)                        
                            const innerVec = getVec(sectorCos, sectorSin, stackAngle, innerRadius)                        

                            vertices.push(...outerVec)
                            vertices.push(...innerVec)

                            normals.push(...normal)
                            normals.push(...normal)

                            if (stack < stacks) {
                                indices.push(verticesOffset, verticesOffset + 1, verticesOffset + 3)
                                indices.push(verticesOffset + 3, verticesOffset + 2, verticesOffset)

                            }

                            verticesOffset += 2
                        }

                        if (sectorAngle === 0) setArcData(angle)
                    })(0);
                }
            })(radius, 0, invertNormals ? -1 : 1, 0)

            return { vertices, indices, normals }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Sphere