import MatUtils from "../../../utils/MatUtils.js";
import Cube from "../solids/Cube.js";
import RectangularCuboid from "../RectangularCuboid.js";

class CubeSkelet {
    constructor(ctx, cuboidWidth, cuboidHeight, settings) {
        this.#cuboid = new RectangularCuboid(`cubeSkeletonCuboid${id}`, ctx, cuboidWidth, cuboidHeight, cuboidHeight);
        this.#cube = new Cube(`cubeSkeletonCube${id}`, ctx, cuboidHeight);

        const yCuboidMat = MatUtils.rotated3d("z", Math.PI / 2);
        const zCuboidMat = MatUtils.rotated3d("y", Math.PI / 2);
        const edgeOffset = cuboidWidth / 2 + cuboidHeight / 2;

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
                MatUtils.mult3d(MatUtils.translated3d(edgeOffset, 0, edgeOffset), yCuboidMat),
                // FRONT LEFT
                MatUtils.mult3d(MatUtils.translated3d(-edgeOffset, 0, edgeOffset), yCuboidMat),
                // BACK RIGHT
                MatUtils.mult3d(MatUtils.translated3d(edgeOffset, 0, -edgeOffset), yCuboidMat),
                // BACK LEFT
                MatUtils.mult3d(MatUtils.translated3d(-edgeOffset, 0, -edgeOffset), yCuboidMat),
                // TOP RIGHT
                MatUtils.mult3d(MatUtils.translated3d(edgeOffset, edgeOffset, 0), zCuboidMat),
                // TOP LEFT
                MatUtils.mult3d(MatUtils.translated3d(-edgeOffset, edgeOffset, 0), zCuboidMat),
                // BOTTOM RIGHT
                MatUtils.mult3d(MatUtils.translated3d(edgeOffset, -edgeOffset, 0), zCuboidMat),
                // BOTTOM LEFT
                MatUtils.mult3d(MatUtils.translated3d(-edgeOffset, -edgeOffset, 0), zCuboidMat),
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

        if (settings?.color && settings.sceneMat) this.prepareModels(settings);
    }

    #cuboid;
    #cube;
    mats;
    modelsData = {};

    prepareModels(settings) {
        this.modelsData.cuboids = {
            uniforms: this.mats.cuboids.map((mat) => ({
                color: settings.color,
                mats: {
                    model: mat,
                    final: MatUtils.mult3d(settings.sceneMat, mat),
                },
            })),
            render: this.#cuboid.render,
        };

        this.modelsData.cubes = {
            uniforms: this.mats.cubes.map((mat) => ({
                color: settings.color,
                mats: {
                    model: mat,
                    final: MatUtils.mult3d(settings.sceneMat, mat),
                },
            })),
            render: this.#cube.render,
        };
    }
}

export default CubeSkelet;
