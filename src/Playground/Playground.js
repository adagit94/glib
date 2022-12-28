import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/solids/Cube.js";
import Plane from "../shapes/planar/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import Scene from "../Scene/Scene.js";
import TruncatedOctahedron from "../shapes/solids/TruncatedOctahedron.js";
import Pyramid from "../shapes/solids/SquarePyramid.js";
import Octahedron from "../shapes/solids/Octahedron.js";
import Cylinder from "../shapes/solids/Cylinder.js";
import Sphere from "../shapes/solids/Sphere.js";
import RectangularCuboid from "../shapes/solids/RectangularCuboid.js";
import CubeSkelet from "../shapes/skelets/CubeSkeleton.js";
import Tetrahedron from "../shapes/solids/Tetrahedron.js";
import TrirectangularTetrahedron from "../shapes/solids/TrirectangularTetrahedron.js";
import Icosahedron from "../shapes/solids/Icosahedron.js";
import AngleUtils from "../utils/AngleUtils.js";
import PentagonalPyramid from "../shapes/solids/PentagonalPyramid.js";
import SpotLight from "../Scene/lights/SpotLight.js";
import PointLight from "../Scene/lights/PointLight.js";
import Dodecahedron from "../shapes/solids/Dodecahedron.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
        });

        // const cameraPosition = [Math.cos(Math.PI / 2) * 4, 0, Math.sin(Math.PI / 2) * 4];
        // const cameraPosition = [-1, 0, -1.1];
        // const cameraPosition = [0, 0, 10];
        const cameraPosition = [0, 0, 5];
        const cameraDirection = [0, 0, -1];
        const lNear = 0.1;
        const lFar = 100;

        const alphaMapWidth = 3200;
        const alphaMapHeight = 1600;
        const alphaMapAspectRatio = alphaMapWidth / alphaMapHeight;

        const scene = (this.scene = new Scene(
            this,
            {
                projection: { fov: Math.PI / 2, near: 0.1, far: 10 },
                camera: { position: cameraPosition, direction: cameraDirection },
                alphaMap: {
                    width: alphaMapWidth,
                    height: alphaMapHeight,
                },
            },
            { ambientLight: [0, 0, 0], camera: { distanceLin: 0.000000001, distanceQuad: 0.00000000125 } }
        ));

        scene.setLights([
            // [
            //     "s1",
            //     new SpotLight(
            //         {
            //             projection: { fov: Math.PI / 2, near: 0.1, far: 100, aspectRatio: alphaMapAspectRatio},
            //             direction: [0, 0, -1],
            //             position: [Math.cos(Math.PI / 2) * 4, 0, Math.sin(Math.PI / 2) * 4],
            //             // position: [0, 0, -2.5],
            //         },
            //         {
            //             color: [0.5, 0, 0],
            //             shininess: 80000,
            //             far: lFar,
            //             cameraPosition,
            //             outerLimit: 0,
            //             innerLimit: 0.25,
            //             distanceLin: 0.00000001,
            //             distanceQuad: 0.0000000125,
            //         }
            //     ),
            // ],
            [
                "s2",
                new SpotLight(
                    {
                        projection: { fov: Math.PI / 2, near: 0.1, far: 100, aspectRatio: alphaMapAspectRatio },
                        direction: [0, 0, -1],
                        // position: [Math.cos(Math.PI / 2) * 4, 0, Math.sin(Math.PI / 2) * 4],
                        // position: [0, 0, 10],
                        position: [0, 0, 10],
                    },
                    {
                        color: [1, 1, 1],
                        shininess: 80000,
                        far: lFar,
                        cameraPosition,
                        outerLimit: 0,
                        innerLimit: 0,
                        distanceLin: 0.00000001,
                        distanceQuad: 0.0000000125,
                    }
                ),
            ],
            // [
            //     "p1",
            //     new PointLight(
            //         {
            //             projection: { fov: Math.PI / 2, near: 0.1, far: 100, aspectRatio: alphaMapAspectRatio },
            //             // position: [Math.cos(Math.PI / 2) * 4, 0, Math.sin(Math.PI / 2) * 4],
            //             position: [0, 0, 2],
            //         },
            //         {
            //             color: [0.5, 0, 0],
            //             shininess: 80000,
            //             cameraPosition,
            //             distanceLin: 0.00000001,
            //             distanceQuad: 0.0000000125,
            //         }
            //     ),
            // ],
        ]);

        const p1Mat = MatUtils.mult3d(MatUtils.translated3d(0, 0, -10), [MatUtils.rotated3d("x", -Math.PI / 2)]);
        const p2Mat = MatUtils.mult3d(MatUtils.translated3d(0, 0, 10), [MatUtils.rotated3d("x", Math.PI / 2)]);
        const p3Mat = MatUtils.mult3d(MatUtils.translated3d(-10, 0, 0), [MatUtils.rotated3d("y", Math.PI / 2), MatUtils.rotated3d("x", Math.PI / 2)]);
        const p4Mat = MatUtils.mult3d(MatUtils.translated3d(10, 0, 0), [MatUtils.rotated3d("y", Math.PI / 2), MatUtils.rotated3d("x", -Math.PI / 2)]);

        scene.setShapes([
            // [
            //     "p1",
            //     new Plane(this, 10, 10, {
            //         uniforms: {
            //             color: [1, 1, 1, 1],
            //             modelMat: p1Mat,
            //         },
            //     }),
            // ],
            // [
            //     "p2",
            //     new Plane(this, 10, 10, {
            //         uniforms: {
            //             color: [1, 1, 1, 1],
            //             modelMat: p2Mat,
            //         },
            //     }),
            // ],
            // [
            //     "p3",
            //     new Plane(this, 10, 10, {
            //         uniforms: {
            //             color: [1, 1, 1, 1],
            //             modelMat: p3Mat,
            //         },
            //     }),
            // ],
            // [
            //     "p4",
            //     new Plane(this, 10, 10, {
            //         uniforms: {
            //             color: [1, 1, 1, 1],
            //             modelMat: p4Mat,
            //         },
            //     }),
            // ],
            [
                "x",
                new TrirectangularTetrahedron(this, 2, {
                    uniforms: {
                        color: [1, 1, 1, 1],
                    },
                }),
            ],
            // [
            //     "c",
            //     new Cube(this, 1, {
            //         invertNormals: true,
            //         uniforms: {
            //             color: [1, 1, 1, 0.75],
            //         },
            //     }),
            // ],
        ]);

        this.animate = true;
        this.requestAnimationFrame();
    }

    renderScene = () => {
        const x = this.scene.getShape("x");
        const xMat = MatUtils.rotated3d("y", this.animData.deltaTime / 2.5);

        x.setUniforms({ modelMat: xMat });

        this.scene.render();
    };
}

export default Playground;
