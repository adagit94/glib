import MatUtils from "../../../utils/MatUtils.js";
import Cube from "../shapes/solids/Cube.js.js";
import RectangularCuboid from "../shapes/solids/RectangularCuboid.js";

class SkeletonCube {
    constructor(cuboidWidth, cuboidHeight) {
        this.cuboid = new RectangularCuboid(cuboidWidth, cuboidHeight, cuboidHeight);
        this.cube = new Cube(cuboidHeight);

        const edgeOffset = cuboidWidth / 2 + cuboidHeight / 2;

        const yCuboidMat = MatUtils.rotated3d("z", Math.PI / 2);
        const zCuboidMat = MatUtils.rotated3d("y", Math.PI / 2);

        this.mats = {
            cuboids: [
                // FRONT TOP
                MatUtils.translated3d(0, edgeOffset, edgeOffset),
                // FRONT BOTTOM
                MatUtils.translated3d(0, -edgeOffset, edgeOffset),
                // BACK TOP
                MatUtils.translated3d(0, edgeOffset, -edgeOffset),
                // BACK BOTTOM
                MatUtils.translated3d(0, -edgeOffset, -edgeOffset),
                // FRONT RIGHT
                MatUtils.multMats3d(MatUtils.translated3d(edgeOffset, 0, edgeOffset), yCuboidMat),
                // FRONT LEFT
                MatUtils.multMats3d(MatUtils.translated3d(-edgeOffset, 0, edgeOffset), yCuboidMat),
                // BACK RIGHT
                MatUtils.multMats3d(MatUtils.translated3d(edgeOffset, 0, -edgeOffset), yCuboidMat),
                // BACK LEFT
                MatUtils.multMats3d(MatUtils.translated3d(-edgeOffset, 0, -edgeOffset), yCuboidMat),
                // TOP RIGHT
                MatUtils.multMats3d(MatUtils.translated3d(edgeOffset, edgeOffset, 0), zCuboidMat),
                // TOP LEFT
                MatUtils.multMats3d(MatUtils.translated3d(-edgeOffset, edgeOffset, 0), zCuboidMat),
                // BOTTOM RIGHT
                MatUtils.multMats3d(MatUtils.translated3d(edgeOffset, -edgeOffset, 0), zCuboidMat),
                // BOTTOM LEFT
                MatUtils.multMats3d(MatUtils.translated3d(-edgeOffset, -edgeOffset, 0), zCuboidMat),
            ],
            cubes: [
                // FRONT TOP RIGHT
                MatUtils.translated3d(edgeOffset, edgeOffset, edgeOffset),
                // FRONT TOP LEFT
                MatUtils.translated3d(-edgeOffset, edgeOffset, edgeOffset),
                // FRONT BOTTOM RIGHT
                MatUtils.translated3d(edgeOffset, -edgeOffset, edgeOffset),
                // FRONT BOTTOM LEFT
                MatUtils.translated3d(-edgeOffset, -edgeOffset, edgeOffset),
                // BACK TOP RIGHT
                MatUtils.translated3d(edgeOffset, edgeOffset, -edgeOffset),
                // BACK TOP LEFT
                MatUtils.translated3d(-edgeOffset, edgeOffset, -edgeOffset),
                // BACK BOTTOM RIGHT
                MatUtils.translated3d(edgeOffset, -edgeOffset, -edgeOffset),
                // BACK BOTTOM LEFT
                MatUtils.translated3d(-edgeOffset, -edgeOffset, -edgeOffset),
            ],
        };
    }

    cuboid;
    cube;
    mats;

    render = () => {};
}

export default SkeletonCube;
