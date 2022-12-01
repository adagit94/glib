import Shape from "../Shape.js.js"

class Cube extends Shape {
    static #SIDES = ["front", "back", "top", "bottom", "right", "left"]
    
    static #NORMALS = {
        front: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ],
        back: [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
        ],
        top: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ],
        bottom: [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
        ],
        right: [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
        ],
        left: [
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ],
    }

    // static #TEXTURE_COORDS = {
    //     front: [
    //         1, 1,
    //         1, 0,
    //         0, 0,
    //         0, 1,
    //     ],
    //     back: [
    //         0, 1,
    //         0, 0,
    //         1, 0,
    //         1, 1,
    //     ],
    //     top: [
    //         1, 0,
    //         1, 1,
    //         0, 1,
    //         0, 0,
    //     ],
    //     bottom: [
    //         1, 0,
    //         1, 1,
    //         0, 1,
    //         0, 0,
    //     ],
    //     right: [
    //         0, 1,
    //         1, 1,
    //         1, 0,
    //         0, 0,
    //     ],
    //     left: [
    //         1, 1,
    //         0, 1,
    //         0, 0,
    //         1, 0,
    //     ],
    // }

    static #INDICES = [
        0, 1, 2,
        0, 3, 2,
        
        4, 5, 6,
        4, 7, 6,

        8, 9, 10,
        10, 11, 8,

        12, 13, 14,
        14, 15, 12,

        16, 17, 18,
        16, 19, 18,

        20, 21, 22,
        20, 23, 22,
    ]

    static #SIDE_Z_COORD_INDICES = [2, 5, 8, 11]

    constructor(name, ctx, sideLength, optionals) {
        super(name, ctx, (instance) => {
            const openedSide = instance.opened = !!optionals?.opened
            const innerLayer = instance.innerLayer = openedSide && !!optionals?.innerLayer
            const invertNormals = instance.invertNormals = !innerLayer && !!optionals?.invertNormals
            const sideHalfLength = sideLength / 2

            const verticesSource = {
                front:[
                    sideHalfLength, sideHalfLength, sideHalfLength, // 0
                    sideHalfLength, -sideHalfLength, sideHalfLength, // 1
                    -sideHalfLength, -sideHalfLength, sideHalfLength, // 2
                    -sideHalfLength, sideHalfLength, sideHalfLength, // 3
                ],
                back:[
                    sideHalfLength, sideHalfLength, -sideHalfLength, // 4
                    sideHalfLength, -sideHalfLength, -sideHalfLength, // 5
                    -sideHalfLength, -sideHalfLength, -sideHalfLength, // 6
                    -sideHalfLength, sideHalfLength, -sideHalfLength, // 7           
                ],
                top:[
                    sideHalfLength, sideHalfLength, sideHalfLength, // 8
                    sideHalfLength, sideHalfLength, -sideHalfLength, // 9
                    -sideHalfLength, sideHalfLength, -sideHalfLength, // 10
                    -sideHalfLength, sideHalfLength, sideHalfLength, // 11
                ],
                bottom:[
                    sideHalfLength, -sideHalfLength, sideHalfLength, // 12
                    sideHalfLength, -sideHalfLength, -sideHalfLength, // 13
                    -sideHalfLength, -sideHalfLength, -sideHalfLength, // 14
                    -sideHalfLength, -sideHalfLength, sideHalfLength, // 15
                ],
                right:[
                    sideHalfLength, sideHalfLength, sideHalfLength, // 16
                    sideHalfLength, sideHalfLength, -sideHalfLength, // 17
                    sideHalfLength, -sideHalfLength, -sideHalfLength, // 18
                    sideHalfLength, -sideHalfLength, sideHalfLength, // 19
                ],
                left:[
                    -sideHalfLength, sideHalfLength, sideHalfLength, // 20
                    -sideHalfLength, sideHalfLength, -sideHalfLength, // 21
                    -sideHalfLength, -sideHalfLength, -sideHalfLength, // 22
                    -sideHalfLength, -sideHalfLength, sideHalfLength, // 23
                ],
            }

            let vertices = [], normals = [], indices = []

            ;(function setData(inner, invertNormals) {
                for (const side of Cube.#SIDES) {
                    const isSideOpened = openedSide && side === "front"

                    let v = verticesSource[side]
                    let n = Cube.#NORMALS[side]

                    if (inner) v = v.map(coord => coord * optionals.innerScale)
                    if (invertNormals) {
                        n = n.map((coord, coordI) => {
                            if (inner && isSideOpened && Cube.#SIDE_Z_COORD_INDICES.includes(coordI)) return coord

                            return coord * -1
                        })
                    }

                    vertices.push(...v)
                    normals.push(...n)
                }

                let i = [...Cube.#INDICES]
                
                if (openedSide) {
                    i.splice(0, 6)
                
                    if (inner) {
                        i = i.map(index => index + 24)

                        // top cuboid
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        normals.push(0, -1, 0)
                        normals.push(0, -1, 0)
                        normals.push(0, -1, 0)
                        normals.push(0, -1, 0)
                        i.push(48, 49, 51)
                        i.push(48, 50, 51)

                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength, sideHalfLength)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        i.push(52, 53, 55)
                        i.push(52, 54, 55)


                        // right cuboid
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        normals.push(-1, 0, 0)
                        normals.push(-1, 0, 0)
                        normals.push(-1, 0, 0)
                        normals.push(-1, 0, 0)
                        i.push(56, 57, 59)
                        i.push(56, 58, 59)

                        vertices.push(sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        i.push(60, 61, 62)
                        i.push(62, 63, 61)

                        // bottom cuboid
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        normals.push(0, 1, 0)
                        normals.push(0, 1, 0)
                        normals.push(0, 1, 0)
                        normals.push(0, 1, 0)
                        i.push(64, 65, 66)
                        i.push(66, 67, 65)

                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(sideHalfLength * optionals.innerScale, -sideHalfLength, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength, sideHalfLength)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        i.push(68, 69, 70)
                        i.push(70, 71, 69)

                        // left cuboid
                        vertices.push(-sideHalfLength, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        normals.push(0, 0, 1)
                        i.push(72, 73, 74)
                        i.push(74, 75, 73)

                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, -sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength)
                        vertices.push(-sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale, sideHalfLength * optionals.innerScale)
                        normals.push(1, 0, 0)
                        normals.push(1, 0, 0)
                        normals.push(1, 0, 0)
                        normals.push(1, 0, 0)
                        i.push(76, 77, 78)
                        i.push(78, 79, 77)

                        // top left cube
                        i.push(72, 73, 53)
                        i.push(53, 3, 72)

                        // top right cube
                        i.push(60, 61, 55)
                        i.push(55, 0, 61)

                        // bottom right cube
                        i.push(62, 63, 69)
                        i.push(69, 1, 63)

                        // bottom left cube
                        i.push(70, 71, 72)
                        i.push(72, 2, 71)
                    }
                }

                indices.push(...i)

                if (innerLayer && !inner) setData(true, true)
            })(false, invertNormals)
        
            return {
                vertices,
                indices,
                normals,
            }
        })
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Cube