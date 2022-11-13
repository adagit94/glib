import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Plane from "../shapes/3d/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Pyramid from "../shapes/3d/Pyramid.js";
import Octahedron from "../shapes/3d/Octahedron.js";
import Cone from "../shapes/3d/Cone.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 0.1, far: 100 },
        });

        new Octahedron("pyr", this, 0.25, 0.1);

        // const cameraPosition = [0, 2, 0];
        const cameraPosition = [Math.cos(Math.PI / 2) * 1, 0, Math.sin(Math.PI / 2) * 1];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]); // [-7, 1.25, 2]
        // const viewMat = MatUtils.view3d(cameraPosition, [0, 1, 0]); // [-7, 1.25, 2]
        const lNear = 0.1;
        const lFar = 100;

        this.mats.scene = MatUtils.mult3d(this.mats.projection, [viewMat]);
        const lightSystem = (this.lightSystem = new LightSystem(this));

        const lightParams = [
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
                    outerLimit: Math.cos(Math.PI / 14),
                    innerLimit: Math.cos(Math.PI / 16),
                    lightDistanceLin: 0.01,
                    lightDistanceQuad: 0.0125,
                    cameraDistanceLin: 0.0001,
                    cameraDistanceQuad: 0.000125,
                },
                depthMap: {
                    far: lFar,
                },
            },
        ];

        lightSystem.addLight(
            "point",
            "pointOne",
            ...structuredClone(lightParams),
            {
                position: [Math.cos(Math.PI / 2) * 2, 0, Math.sin(Math.PI / 2) * 2],
            }
        );

        // lightSystem.addLight("point", "pointTwo", ...lightParams, {
        //     position: [Math.cos(Math.PI / 2) * 2, 0, -Math.sin(Math.PI / 2) * 2],
        // });

        // lightSystem.addLight("spot", "spotOne", ...lightParams, {
        //     position: [Math.cos(Math.PI / 2) * 2, 0, Math.sin(Math.PI / 2) * 2],
        //     direction: [0, 0, -1],
        // });

        // lightSystem.addLight("spot", "spotTwo", ...lightParams, {
        //     position: [Math.cos(Math.PI / 2) * 2, 0, -Math.sin(Math.PI / 2) * 2],
        //     direction: [0, 0, 1],
        // });
        // lightSystem.addLight("point", "pointOne", ...lightParams, { position: [Math.cos(Math.PI / 2) * 2, 0, Math.sin(Math.PI / 2) * 2] });
        // lightSystem.addLight("point", "pointTwo", ...lightParams, { position: [0, -10, 0] });

        this.animate = false;
        this.requestAnimationFrame();
        console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("pointOne");

        // const lPos = [Math.cos(Math.PI / 8) * 16, 0, Math.sin(Math.PI / 8) * 16];;

        // this.lightSystem.getLight("second").active = false

        console.log("this.shapes.pyr", this.shapes.pyr);

        this.shapes.pyr.mats.model = MatUtils.rotated3d("y", this.animData.deltaTime / 5);
        // this.shapes.pyr.mats.model = MatUtils.rotated3d("y", 0);

        this.lightSystem.setModels({
            hex: {
                uniforms: {
                    color: [1, 1, 1],
                    mats: {
                        model: this.shapes.pyr.mats.model,
                        final: MatUtils.mult3d(this.mats.scene, this.shapes.pyr.mats.model),
                    },
                },
                // culling: { preventDmFront: true },
                render: this.shapes.pyr.render,
            },
        });
        this.lightSystem.renderLights();
    };
}

export default Playground;
