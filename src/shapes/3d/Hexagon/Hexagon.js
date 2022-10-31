import Shape from "../../Shape.js";
import HexagonUtils from "./HexagonUtils.js";

class Hexagon extends Shape {
    constructor(name, ctx, squareSide) {
        super(name, ctx, () => HexagonUtils.getHexagonData(squareSide))
    }
}

export default Hexagon;
