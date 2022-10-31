import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Plane from "../shapes/3d/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 1, far: 80 },
        });

        const hex = new Hexagon("hex", this, 0.25);

        hex.mats.model = MatUtils.translated3d(0, 0, 0)

        // const cameraPosition = [0, 0, 0];
        const cameraPosition = [Math.cos(Math.PI / 8) * 10, 0.1, Math.sin(Math.PI / 8) * 10];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]); // [-7, 1.25, 2]
        const lNear = 1;
        const lFar = 80;

        this.mats.scene = MatUtils.mult3d(this.mats.projection, [viewMat]);
        const lightSystem = (this.lightSystem = new LightSystem(this));

        lightSystem.addLight(
            "point",
            "pointOne",
            {
                size: 800,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar), // should fov be predefined?
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
            { position: [Math.cos(Math.PI / 2.5) * 10, 0.2, Math.sin(Math.PI / 2.5) * 10] }
        );

        this.animate = false;
        this.requestAnimationFrame();
        console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("pointOne");


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
