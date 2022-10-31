import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Plane from "../shapes/3d/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 1, far: 80 },
        });

        const wireframe = false;

        new Plane("plane", this, 0.8, 1, 1, wireframe);
        new Cube("cube", this, 0.2, wireframe);

        // const cameraPosition = [0, 0, 0];
        const cameraPosition = [Math.cos(Math.PI / 8) * 10, 0.1, Math.sin(Math.PI / 8) * 10];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]); // [-7, 1.25, 2]
        const lNear = 1;
        const lFar = 80;

        this.mats.scene = MatUtils.mult3d(this.mats.projection, [viewMat]);
        const lightSystem = (this.lightSystem = new LightSystem(this));

        lightSystem.addLight(
            "spot",
            "first",
            {
                size: 800,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [1, 0, 0],
                    // shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 26),
                    innerLimit: Math.cos(Math.PI / 28),
                    lightDistanceLin: 0.01,
                    lightDistanceQuad: 0.0125,
                    cameraDistanceLin: 0.0001,
                    cameraDistanceQuad: 0.000125,
                },
                depthMap: {
                    far: lFar,
                },
            },
            { position: [-Math.cos(Math.PI / 2.5) * 9, 0.2, Math.sin(Math.PI / 2.5) * 9], direction: [0.25, 0, -1] }
        );

        lightSystem.addLight(
            "spot",
            "second",
            {
                size: 800,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [0, 0, 1],
                    // shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 26),
                    innerLimit: Math.cos(Math.PI / 28),
                    lightDistanceLin: 0.01,
                    lightDistanceQuad: 0.0125,
                    cameraDistanceLin: 0.0001,
                    cameraDistanceQuad: 0.000125,
                },
                depthMap: {
                    far: lFar,
                },
            },
            { position: [Math.cos(Math.PI / 2.5) * 9, 0.2, Math.sin(Math.PI / 2.5) * 9], direction: [-0.25, 0, -1] }
        );

        lightSystem.addLight(
            "point",
            "third",
            {
                size: 800,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [0, 0, 1],
                    // shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 26),
                    innerLimit: Math.cos(Math.PI / 28),
                    lightDistanceLin: 0.01,
                    lightDistanceQuad: 0.0125,
                    cameraDistanceLin: 0.0001,
                    cameraDistanceQuad: 0.000125,
                },
                depthMap: {
                    far: lFar,
                },
            },
            { position: [Math.cos(Math.PI / 2.5) * 9, 0.2, Math.sin(Math.PI / 2.5) * 9] }
        );

        this.animate = false;
        this.requestAnimationFrame();
        console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("first");
        const secondSpotLight = this.lightSystem.getLight("second");
        const thirdSpotLight = this.lightSystem.getLight("third");

        // firstSpotLight.active = false
        secondSpotLight.active = false;
        // thirdSpotLight.active = false;

        const planeMats = [
            MatUtils.mult3d(this.shapes.plane.mats.origin, [
                MatUtils.translated3d(-2.5, 2.4, -5),
                MatUtils.rotated3d("x", -Math.PI / 2),
                MatUtils.scaled3d(6, 6, 6),
            ]),
            MatUtils.mult3d(this.shapes.plane.mats.origin, [
                MatUtils.translated3d(0, -2.4, 16),
                MatUtils.rotated3d("x", Math.PI / 2),
                MatUtils.scaled3d(6, 6, 6),
            ]),
        ];
        const cubeMats = [
            MatUtils.mult3d(MatUtils.translated3d(0, 0, 0), [MatUtils.scaled3d(10, 10, 10)]),
            MatUtils.mult3d(MatUtils.translated3d(0, 0, 10), [MatUtils.scaled3d(10, 10, 10)]),
        ];

        // const lPos = [Math.cos(Math.PI / 8) * 16, 0, Math.sin(Math.PI / 8) * 16];;

        // this.lightSystem.getLight("second").active = false

        this.lightSystem.setModels({
            plane: {
                uniforms: {
                    color: [1, 1, 1],
                    mats: {
                        model: planeMats[0],
                        final: MatUtils.mult3d(this.mats.scene, planeMats[0]),
                    },
                },
                render: this.shapes.plane.render,
            },
            cube: {
                uniforms: {
                    color: [1, 1, 1],
                    mats: {
                        model: cubeMats[0],
                        final: MatUtils.mult3d(this.mats.scene, cubeMats[0]),
                    },
                },
                render: this.shapes.cube.render,
            },
        });
        this.lightSystem.renderLights();
    };
}

export default Playground;
