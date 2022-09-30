import ShaderUtils from "../../utils/MatUtils.js"
import Cube from "./Cube.js"
import SquareCuboid from "./SquareCuboid.js"

class SkeletonCube {
    constructor(cuboidWidth, cuboidHeight, wireframe) {
        this.cuboid = new SquareCuboid(cuboidWidth, cuboidHeight, wireframe)
        this.cube = new Cube(cuboidHeight, wireframe)

        const edgeOffset = cuboidWidth / 2 + cuboidHeight / 2

        const yCuboidMat = ShaderUtils.init3dRotationMat("z", Math.PI / 2)
        const zCuboidMat = ShaderUtils.init3dRotationMat("y", Math.PI / 2)
        
        this.mats = {
            cuboids: [
                // FRONT TOP
                ShaderUtils.init3dTranslationMat(0, edgeOffset, edgeOffset),
                // FRONT BOTTOM
                ShaderUtils.init3dTranslationMat(0, -edgeOffset, edgeOffset),
                // BACK TOP
                ShaderUtils.init3dTranslationMat(0, edgeOffset, -edgeOffset),
                // BACK BOTTOM
                ShaderUtils.init3dTranslationMat(0, -edgeOffset, -edgeOffset),
                // FRONT RIGHT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(edgeOffset, 0, edgeOffset), yCuboidMat),
                // FRONT LEFT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(-edgeOffset, 0, edgeOffset), yCuboidMat),
                // BACK RIGHT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(edgeOffset, 0, -edgeOffset), yCuboidMat),
                // BACK LEFT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(-edgeOffset, 0, -edgeOffset), yCuboidMat),
                // TOP RIGHT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(edgeOffset, edgeOffset, 0), zCuboidMat),
                // TOP LEFT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(-edgeOffset, edgeOffset, 0), zCuboidMat),
                // BOTTOM RIGHT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(edgeOffset, -edgeOffset, 0), zCuboidMat),
                // BOTTOM LEFT
                ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(-edgeOffset, -edgeOffset, 0), zCuboidMat),
            ],
            cubes: [
                // FRONT TOP RIGHT
                ShaderUtils.init3dTranslationMat(edgeOffset, edgeOffset, edgeOffset),
                // FRONT TOP LEFT
                ShaderUtils.init3dTranslationMat(-edgeOffset, edgeOffset, edgeOffset),
                // FRONT BOTTOM RIGHT
                ShaderUtils.init3dTranslationMat(edgeOffset, -edgeOffset, edgeOffset),
                // FRONT BOTTOM LEFT
                ShaderUtils.init3dTranslationMat(-edgeOffset, -edgeOffset, edgeOffset),
                // BACK TOP RIGHT
                ShaderUtils.init3dTranslationMat(edgeOffset, edgeOffset, -edgeOffset),
                // BACK TOP LEFT
                ShaderUtils.init3dTranslationMat(-edgeOffset, edgeOffset, -edgeOffset),
                // BACK BOTTOM RIGHT
                ShaderUtils.init3dTranslationMat(edgeOffset, -edgeOffset, -edgeOffset),
                // BACK BOTTOM LEFT
                ShaderUtils.init3dTranslationMat(-edgeOffset, -edgeOffset, -edgeOffset),
            ]
        }
    }

    cuboid
    cube
    mats
}

export default SkeletonCube