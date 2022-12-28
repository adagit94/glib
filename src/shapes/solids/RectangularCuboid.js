import Shape from "../Shape.js"

class RectangularCuboid extends Shape {
    static #NORMALS = {
        front: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
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

    static #SIDES = ["top", "bottom", "front", "back", "right", "left"]
    
    constructor(ctx, width, height, depth, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const opened = !!optionals?.opened && RectangularCuboid.#SIDES.includes(optionals.opened) ? optionals.opened : false
            const invertNormals = !!optionals?.invertNormals
            
            const widthHalf = width / 2
            const heightHalf = height / 2
            const depthHalf = depth / 2
            
            const verticesSource = {
                front: [
                    widthHalf, heightHalf, depthHalf, // 0
                    widthHalf, -heightHalf, depthHalf, // 1
                    -widthHalf, -heightHalf, depthHalf, // 2
                    -widthHalf, heightHalf, depthHalf, // 3
                ],
                back: [
                    widthHalf, heightHalf, -depthHalf, // 4
                    widthHalf, -heightHalf, -depthHalf, // 5
                    -widthHalf, -heightHalf, -depthHalf, // 6
                    -widthHalf, heightHalf, -depthHalf, // 7           
                ],
                top: [
                    widthHalf, heightHalf, depthHalf, // 8
                    widthHalf, heightHalf, -depthHalf, // 9
                    -widthHalf, heightHalf, -depthHalf, // 10
                    -widthHalf, heightHalf, depthHalf, // 11
                ],
                bottom: [
                    widthHalf, -heightHalf, depthHalf, // 12
                    widthHalf, -heightHalf, -depthHalf, // 13
                    -widthHalf, -heightHalf, -depthHalf, // 14
                    -widthHalf, -heightHalf, depthHalf, // 15
                ],
                right: [
                    widthHalf, heightHalf, depthHalf, // 16
                    widthHalf, heightHalf, -depthHalf, // 17
                    widthHalf, -heightHalf, -depthHalf, // 18
                    widthHalf, -heightHalf, depthHalf, // 19
                ],
                left: [
                    -widthHalf, heightHalf, depthHalf, // 20
                    -widthHalf, heightHalf, -depthHalf, // 21
                    -widthHalf, -heightHalf, -depthHalf, // 22
                    -widthHalf, -heightHalf, depthHalf, // 23
                ],
            }
            let vertices = [], normals = [], indices = RectangularCuboid.#INDICES.slice(0, opened ? RectangularCuboid.#INDICES.length - 6 : RectangularCuboid.#INDICES.length)

            for (const side of RectangularCuboid.#SIDES) {
                if (opened === side) continue

                let sideNormals = RectangularCuboid.#NORMALS[side]
                if (invertNormals) sideNormals = sideNormals.map(n => n * -1)

                vertices.push(...verticesSource[side])
                normals.push(...sideNormals)

            }
            
            return { vertices, normals, indices }
        })
    }
}

export default RectangularCuboid