import Shape from "../Shape.js"

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

    static #TEXTURE_COORDS = {
        front: [
            1, 1,
            1, 0,
            0, 0,
            0, 1,
        ],
        back: [
            0, 1,
            0, 0,
            1, 0,
            1, 1,
        ],
        top: [
            1, 0,
            1, 1,
            0, 1,
            0, 0,
        ],
        bottom: [
            1, 0,
            1, 1,
            0, 1,
            0, 0,
        ],
        right: [
            0, 1,
            1, 1,
            1, 0,
            0, 0,
        ],
        left: [
            1, 1,
            0, 1,
            0, 0,
            1, 0,
        ],
    }

    constructor(ctx, sideLength, optionals) {
        super(ctx, optionals?.uniforms, (instance) => {
            const openedSide = instance.opened = !!optionals?.opened
            const invertNormals = instance.invertNormals = !!optionals?.invertNormals
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

            let vertices = [], normals = [], indices = [...Cube.#INDICES]
            
            if (openedSide) indices.splice(0, 6)

            for (const side of Cube.#SIDES) {
                let v = verticesSource[side]
                let n = Cube.#NORMALS[side]

                if (invertNormals) n = n.map((coord) => coord * -1)

                vertices.push(...v)
                normals.push(...n)
            }

            return {
                vertices,
                indices,
                normals,
            }
        })
    }
}

export default Cube