import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/solids/Cube.js.js";
import Plane from "../shapes/solids/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";
import Hexagon from "../shapes/solids/Hexagon/Hexagon.js";
import Pyramid from "../shapes/solids/Pyramid.js";
import Octahedron from "../shapes/solids/Octahedron.js";
import Cone from "../shapes/solids/Cone.js";
import Cylinder from "../shapes/solids/Cylinder.js";
import Sphere from "../shapes/solids/Sphere.js";
import RectangularCuboid from "../shapes/solids/RectangularCuboid.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 0.1, far: 50 },
        });

        // new Sphere("pyr", this, 2, 100, 100, { angle: Math.PI * 2, innerLayer: false, invertNormals: false, innerScale: 0.80 });
        new Plane("pyr", this, 2, 2);

        // const cameraPosition = [0, 0, 0];
        const cameraPosition = [Math.cos(Math.PI / 2) * 2, 0.5, Math.sin(Math.PI / 2) * 2];
        const viewMat = MatUtils.view3d(cameraPosition, [0, -1, -1]);
        const lNear = 0.1;
        const lFar = 50;

        this.mats.scene = MatUtils.mult3d(this.mats.projection, [viewMat]);
        const lightSystem = (this.lightSystem = new LightSystem(this));

        const lightParams = [
            {
                size: 3200,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [0.75, 0.75, 0.75],
                    // shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 14),
                    innerLimit: Math.cos(Math.PI / 16),
                    lightDistanceLin: 0.01,
                    lightDistanceQuad: 0.0125,
                    cameraDistanceLin: 0.001,
                    cameraDistanceQuad: 0.00125,
                },
                depthMap: {
                    far: lFar,
                },
            },
        ];

        lightSystem.addLight("point", "pointOne", ...structuredClone(lightParams), {
            // position: [Math.cos(Math.PI / 2) * 6, 0, Math.sin(Math.PI / 2) * 6],
            position: [0, 2, 0],
        });

        this.animate = false;
        this.requestAnimationFrame();
        // console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("pointOne");
        // this.lightSystem.getLight("second").active = false

        this.shapes.pyr.mats.model = MatUtils.mult3d(MatUtils.translated3d(0, 0, 0), [MatUtils.rotated3d("x", 0), MatUtils.rotated3d("x", 0)]); // this.animData.deltaTime / 5

        this.lightSystem.setModels({
            hex: {
                uniforms: {
                    color: [1, 1, 1],
                    mats: {
                        model: this.shapes.pyr.mats.model,
                        final: MatUtils.mult3d(this.mats.scene, this.shapes.pyr.mats.model),
                    },
                },
                render: this.shapes.pyr.render,
            },
        });
        this.lightSystem.renderLights();
    };
}

export default Playground;
