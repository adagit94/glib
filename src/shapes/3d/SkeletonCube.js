import ShaderUtils from "../../utils/MatUtils.js"
import Cube from "./Cube.js"
import SquareCuboid from "./SquareCuboid.js"

class SkeletonCube {
    constructor(cuboidWidth, cuboidHeight, wireframe) {
        this.cuboid = new SquareCuboid(cuboidWidth, cuboidHeight, wireframe)
        this.cube = new Cube(cuboidHeight, wireframe)

        const edgeOffset = cuboidWidth / 2 + cuboidHeight / 2

        const yCuboidMat = ShaderUtils.rotated3d("z", Math.PI / 2)
        const zCuboidMat = ShaderUtils.rotated3d("y", Math.PI / 2)
        
        this.mats = {
            cuboids: [
                // FRONT TOP
                ShaderUtils.translated3d(0, edgeOffset, edgeOffset),
                // FRONT BOTTOM
                ShaderUtils.translated3d(0, -edgeOffset, edgeOffset),
                // BACK TOP
                ShaderUtils.translated3d(0, edgeOffset, -edgeOffset),
                // BACK BOTTOM
                ShaderUtils.translated3d(0, -edgeOffset, -edgeOffset),
                // FRONT RIGHT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(edgeOffset, 0, edgeOffset), yCuboidMat),
                // FRONT LEFT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(-edgeOffset, 0, edgeOffset), yCuboidMat),
                // BACK RIGHT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(edgeOffset, 0, -edgeOffset), yCuboidMat),
                // BACK LEFT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(-edgeOffset, 0, -edgeOffset), yCuboidMat),
                // TOP RIGHT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(edgeOffset, edgeOffset, 0), zCuboidMat),
                // TOP LEFT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(-edgeOffset, edgeOffset, 0), zCuboidMat),
                // BOTTOM RIGHT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(edgeOffset, -edgeOffset, 0), zCuboidMat),
                // BOTTOM LEFT
                ShaderUtils.multMats3d(ShaderUtils.translated3d(-edgeOffset, -edgeOffset, 0), zCuboidMat),
            ],
            cubes: [
                // FRONT TOP RIGHT
                ShaderUtils.translated3d(edgeOffset, edgeOffset, edgeOffset),
                // FRONT TOP LEFT
                ShaderUtils.translated3d(-edgeOffset, edgeOffset, edgeOffset),
                // FRONT BOTTOM RIGHT
                ShaderUtils.translated3d(edgeOffset, -edgeOffset, edgeOffset),
                // FRONT BOTTOM LEFT
                ShaderUtils.translated3d(-edgeOffset, -edgeOffset, edgeOffset),
                // BACK TOP RIGHT
                ShaderUtils.translated3d(edgeOffset, edgeOffset, -edgeOffset),
                // BACK TOP LEFT
                ShaderUtils.translated3d(-edgeOffset, edgeOffset, -edgeOffset),
                // BACK BOTTOM RIGHT
                ShaderUtils.translated3d(edgeOffset, -edgeOffset, -edgeOffset),
                // BACK BOTTOM LEFT
                ShaderUtils.translated3d(-edgeOffset, -edgeOffset, -edgeOffset),
            ]
        }
    }

    cuboid
    cube
    mats
}

export default SkeletonCube