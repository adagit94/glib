import MatUtils from "../utils/MatUtils.js";
import Framer from "../Generator/Framer/Framer.js";
import Scene from "../scene-systems/basic/Scene.js";
import SpotLight from "../scene-systems/basic/lights/SpotLight.js";
import PointLight from "../scene-systems/basic/lights/PointLight.js";
import TetrahedronSkelet from "../shapes/solids/Tetrahedron/TetrahedronSkelet.js";
import Sphere from "../shapes/solids/Sphere.js";
import TriangularPlane from "../shapes/planar/patterns/TriangularPlane.js";
import Tetrahedron from "../shapes/solids/Tetrahedron/Tetrahedron.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
        });

        const cameraPosition = [Math.cos(Math.PI / 2) * 10, 0, Math.sin(Math.PI / 2) * 10];
        // const cameraPosition = [Math.cos(Math.PI * 0.75) * 5, 0, Math.sin(Math.PI * 0.75) * 5];
        // const cameraPosition = [0, 0, 5];
        const cameraDirection = [0, 0, -1];
        const lNear = 0.1;
        const lFar = 100;

        const alphaMapWidth = 3200;
        const alphaMapHeight = 1600;
        const alphaMapAspectRatio = alphaMapWidth / alphaMapHeight;

        const scene = (this.scene = new Scene(
            this,
            {
                projection: { fov: Math.PI / 2, near: 0.1, far: 100 },
                camera: { position: cameraPosition, direction: cameraDirection },
                alphaMap: {
                    width: alphaMapWidth,
                    height: alphaMapHeight,
                },
            },
            { ambientLight: [0.5, 0, 0], camera: { distanceLin: 0.000000001, distanceQuad: 0.00000000125 } }
        ));

        scene.setLights([
            [
                "s1",
                new SpotLight(
                    {
                        projection: { fov: Math.PI / 2, near: 0.1, far: 100, aspectRatio: alphaMapAspectRatio },
                        direction: [0, 0, -1],
                        position: [0, 0, 15],
                    },
                    {
                        color: [1, 1, 1],
                        shininess: 80000,
                        far: lFar,
                        outerLimit: 0,
                        innerLimit: 0.9,
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
            //             distanceLin: 0.00000001,
            //             distanceQuad: 0.0000000125,
            //         }
            //     ),
            // ],
        ]);

        const tetron = (this.tetron = new TetrahedronSkelet(this, {
            internal: true,
            external: true,
            cubeSideLength: 4,
            vertex: { color: [1, 0.5, 0, 1], r: 0.25 },
            edge: { middle: { color: [1, 0.5, 0, 1], r: 0.125 }, side: { color: [1, 0.5, 0, 1], r: 0.0625 } },
            scale: 1,
        }));

        scene.setShapes(tetron.getShapes());
        // scene.setShapes([
        //     [
        //         "a",
        //         new Tetrahedron(this, 2.5, {
        //             uniforms: {
        //                 color: [1, 1, 1, 1],
        //             },
        //         }),
        //     ],
        // ]);

        this.animate = false;
        this.requestAnimationFrame();
    }

    renderScene = () => {
        const shapeA = this.scene.getShape("a");
        const mat = MatUtils.rotated3d("y", this.animData.deltaTime / 20);

        this.tetron.transform(mat);

        // shapeA.setUniforms({ modelMat: mat });

        this.scene.render();
    };
}

export default Playground;
