import HexagonUtils from "./HexagonUtils.js";

class Hexagon {
    constructor(squareSide) {
        const { vertices, indices, normals } = HexagonUtils.getHexagonData(squareSide);

        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
    }

    vertices
    indices
    normals
}

export default Hexagon;
