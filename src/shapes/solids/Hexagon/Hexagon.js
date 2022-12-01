import Shape from "../../Shape.js";
import HexagonUtils from "./HexagonUtils.js";

class Hexagon extends Shape {
    constructor(name, ctx, squareSide) {
        super(name, ctx, () => HexagonUtils.getHexagonData(squareSide))
    }

    render = () => {
        this.drawElements(this.gl.TRIANGLES)
    }
}

export default Hexagon;
