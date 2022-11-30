import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Plane from "../shapes/3d/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Pyramid from "../shapes/3d/Pyramid.js";
import Octahedron from "../shapes/3d/Octahedron.js";
import Cone from "../shapes/3d/Cone.js";
import Cylinder from "../shapes/3d/Cylinder.js";
import Sphere from "../shapes/3d/Sphere.js";
import RectangularCuboid from "../shapes/3d/RectangularCuboid.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 0.1, far: 50 },
        });

        // new Sphere("pyr", this, 2, 100, 100, { angle: Math.PI * 2, innerLayer: false, invertNormals: false, innerScale: 0.80 });
        new RectangularCuboid("pyr", this, 4, 2, 1, { invertNormals: true, opened: "bottom" });

        // const cameraPosition = [0, 0, 0];
        const cameraPosition = [Math.cos(Math.PI / 2) * 6, 0, Math.sin(Math.PI / 2) * 6];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]);
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
            position: [Math.cos(Math.PI / 2) * 6, 0, Math.sin(Math.PI / 2) * 6],
            // position: [0, 0, 0],
        });

        this.animate = false;
        this.requestAnimationFrame();
        // console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("pointOne");
        // this.lightSystem.getLight("second").active = false

        this.shapes.pyr.mats.model = MatUtils.mult3d(MatUtils.translated3d(0, 0, 0), [MatUtils.rotated3d("x", 0), MatUtils.rotated3d("x", this.animData.deltaTime / 5)]); // Math.PI / 8   

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
