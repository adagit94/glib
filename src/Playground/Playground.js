import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/solids/Cube.js";
import Plane from "../shapes/Plane.js";
import Framer from "../Generator/Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";
import TruncatedOctahedron from "../shapes/solids/TruncatedOctahedron.js";
import Pyramid from "../shapes/solids/SquarePyramid.js";
import Octahedron from "../shapes/solids/Octahedron.js";
import Cone from "../shapes/solids/Cone.js";
import Cylinder from "../shapes/solids/Cylinder.js";
import Sphere from "../shapes/solids/Sphere.js";
import RectangularCuboid from "../shapes/solids/RectangularCuboid.js";
import CubeSkeleton from "../structures/CubeSkeleton.js";
import Tetrahedron from "../shapes/solids/Tetrahedron.js";
import TrirectangularTetrahedron from "../shapes/solids/TrirectangularTetrahedron.js";
import Icosahedron from "../shapes/solids/Icosahedron.js";
import AngleUtils from "../utils/AngleUtils.js";
import PentagonalPyramid from "../shapes/solids/PentagonalPyramid.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 2, near: 0.1, far: 100 },
        });

        // const cameraPosition = [0, 0.5, 0];
        const cameraPosition = [Math.cos(Math.PI / 2) * 2, 0, Math.sin(Math.PI / 2) * 2];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]);
        const lNear = 0.1;
        const lFar = 100;

        new Icosahedron("icosaHedron", this, 0.5);

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
                    shininess: 1024,
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

        lightSystem.shadows = false;

        lightSystem.addLight("point", "pointOne", ...structuredClone(lightParams), {
            position: [Math.cos(Math.PI / 2) * 2, 0, Math.sin(Math.PI / 2) * 2],
            // position: [0, 0.5, 0],
        });

        this.animate = false;
        this.requestAnimationFrame();
        // console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("pointOne");
        // this.lightSystem.getLight("second").active = false

        const modelMat = (this.shapes.icosaHedron.mats.model = MatUtils.mult3d(MatUtils.translated3d(0, 0, 0), [
            // MatUtils.rotated3d("y", -AngleUtils.degToRad(72)),
            // MatUtils.rotated3d("y", 0),
            MatUtils.rotated3d("x", this.animData.deltaTime / 5),
        ]));

        this.lightSystem.setModels({
            icosaHedron: {
                uniforms: {
                    color: [1, 1, 1],
                    mats: {
                        model: modelMat,
                        final: MatUtils.mult3d(this.mats.scene, modelMat),
                    },
                },
                render: this.shapes.icosaHedron.render,
            },
        });
        this.lightSystem.renderLights();
    };
}

export default Playground;
