import Shape from "../Shape.js";

class Plane extends Shape {
    static #INDICES = [0, 1, 2, 2, 3, 0];

    static #NORMALS = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

    static #TEXTURE_COORDS = [1, 0, 0, 0, 0, 1, 1, 1];

    constructor(ctx, w, d, optionals) {
        super(ctx, optionals?.uniforms, () => {
            const halfW = w / 2;
            const halfD = d / 2;

            let vertices = [];

            vertices.push(halfW, 0, halfD);
            vertices.push(-halfW, 0, halfD);
            vertices.push(-halfW, 0, -halfD);
            vertices.push(halfW, 0, -halfD);

            return { vertices, indices: Plane.#INDICES, normals: Plane.#NORMALS, textureCoords: Plane.#TEXTURE_COORDS };
        });

        this.sortTriangles = false;
    }
}

export default Plane;
