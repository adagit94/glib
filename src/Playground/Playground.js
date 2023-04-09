import MatUtils from "../utils/MatUtils.js";
import Framer from "../Generator/Framer/Framer.js";
import Scene from "../scene-systems/basic/Scene.js";
import SpotLight from "../scene-systems/basic/lights/SpotLight.js";
import PointLight from "../scene-systems/basic/lights/PointLight.js";
import TetrahedronSkelet from "../shapes/solids/Tetrahedron/TetrahedronSkelet.js";
import Sphere from "../shapes/solids/Sphere.js";
import Cube from "../shapes/solids/Cube/Cube.js";
import TriangularPlane from "../shapes/planar/patterns/TriangularPlane.js";
import Tetrahedron from "../shapes/solids/Tetrahedron/Tetrahedron.js";
import SphericMagnet from "../effects/magnetism/SphericMagnet.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
        });

        const cameraPosition = [Math.cos(-Math.PI / 2) * 50, 0, Math.sin(-Math.PI / 2) * 50];
        // const cameraPosition = [Math.cos(Math.PI * 0.75) * 5, 0, Math.sin(Math.PI * 0.75) * 5];
        // const cameraPosition = [0, 0, 5];
        const cameraDirection = [0, 0, 1];
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
            { ambientLight: [0, 0, 0], camera: { distanceLin: 0.000000001, distanceQuad: 0.00000000125 } }
        ));

        scene.setLights([
            [
                "s1",
                new SpotLight(
                    {
                        projection: { fov: Math.PI / 2, near: 0.1, far: 100, aspectRatio: alphaMapAspectRatio },
                        direction: [0, 0, 1],
                        position: [0, 0, -50],
                    },
                    {
                        color: [1, 1, 1],
                        shininess: 80000,
                        far: lFar,
                        outerLimit: 0,
                        innerLimit: 0.1,
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

        let c1 = new Cube(this, 10, {
            uniforms: {
                color: [1, 1, 1, 1],
            },
        });
        let m1 = new SphericMagnet({ r: 50, polarity: 1, exp: 1.75 });

        c1.getEffect("magnetism").active = true;
        // c1.mats.origin = MatUtils.translated3d(25, 25, 25);
        // c1.mats.orientation = MatUtils.rotated3d("y", Math.PI / 4);

        c1.perVertexOps = true;
        c1.mats.offset = MatUtils.translated3d(25, 25, 25);
        c1.transposeVertices();
        c1.mats.offset = MatUtils.identity3d();

        scene.setShapes([["c1", c1]]);
        scene.setMagnets([["m1", m1]]);

        this.animate = false;
        this.requestAnimationFrame();
    }

    renderScene = () => {
        // const mat = MatUtils.rotated3d("y", this.animData.delta / 20);
        // shapeA.setUniforms({ modelMat: mat });

        this.scene.getShape("c1").mats.offset = MatUtils.translated3d(this.animData.frameDelta * 3, 0, 0);

        this.scene.render(this.animData.frameDelta);
    };
}

export default Playground;
