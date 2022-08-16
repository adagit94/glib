class Cone {
    constructor(circleData, height) {
        this.#initCone(circleData, height);
    }

    #initCone(circleData, height) {
        const { r, vertices } = circleData;
        const angle = Math.PI * 2;
        const angleStep = angle / (vertices - 1);
        let coordinates = [0, height, 0];

        for (let vertex = 0; vertex < vertices; vertex++) {
            const rad = angleStep * vertex;
            const x = Math.cos(rad) * r;
            const z = Math.sin(rad) * r;

            coordinates.push(x, 0, z);
        }

        this.coordinates = coordinates;
    }
}

export default Cone;
