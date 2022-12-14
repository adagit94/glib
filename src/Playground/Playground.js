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
        // const cameraPosition = [-Math.cos(Math.PI / 4) * 1, 0, Math.sin(Math.PI / 4) * 1];
        const cameraPosition = [Math.cos(Math.PI / 1.75) * 1, 0, Math.sin(Math.PI / 2) * 1];
        // const cameraPosition = [-Math.cos(0) * 3, 0, Math.sin(0) * 3];
        const viewMat = MatUtils.view3d(cameraPosition, [1, 0, -1]);
        const lNear = 0.1;
        const lFar = 100;

        new Plane("plane1", this, 1, 1);
        new Plane("plane2", this, 0.25, 0.25);

        this.mats.scene = MatUtils.mult3d(this.mats.projection, [viewMat]);
        const lightSystem = (this.lightSystem = new LightSystem(this));

        // lightSystem.addLight(
        //     "point",
        //     "pointOne",
        //     {
        //         size: 3200,
        //         lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
        //     },
        //     {
        //         light: {
        //             ambientColor: [0, 0, 0],
        //             lightColor: [1, 0, 0],
        //             shininess: 1024,
        //             far: lFar,
        //             cameraPosition,
        //             outerLimit: Math.cos(Math.PI / 14),
        //             innerLimit: Math.cos(Math.PI / 16),
        //             lightDistanceLin: 0.0001,
        //             lightDistanceQuad: 0.000125,
        //             cameraDistanceLin: 0.00001,
        //             cameraDistanceQuad: 0.0000125,
        //         },
        //         depthMap: {
        //             far: lFar,
        //         },
        //     },
        //     {
        //         position: [-Math.cos(Math.PI / 4) * 1, 0, Math.sin(Math.PI / 2) * 1],
        //         // position: [0, 0.5, 0],
        //     }
        // );

        lightSystem.addLight(
            "point",
            "pointTwo",
            {
                ambientColor: [0, 0, 0],
                lightColor: [0, 0, 1],
                shininess: 1024,
                far: lFar,
                cameraPosition,
                outerLimit: Math.cos(Math.PI / 14),
                innerLimit: Math.cos(Math.PI / 16),
                lightDistanceLin: 0.0001,
                lightDistanceQuad: 0.000125,
                cameraDistanceLin: 0.00001,
                cameraDistanceQuad: 0.0000125,
                depthMap: {
                    far: lFar,
                },
            },
            {
                // position: [0, 0.5, 0],
                position: [Math.cos(Math.PI / 2) * 1, 0, Math.sin(Math.PI / 4) * 1],
                depthMap: {
                    size: 3200,
                    lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
                },
            }
        );

        lightSystem.shadows = false;
        this.animate = false;
        this.requestAnimationFrame();
        // console.log(this);
    }

    renderScene = () => {
        const firstSpotLight = this.lightSystem.getLight("pointOne");
        // this.lightSystem.getLight("pointTwo").active = false

        const plane1Mat = MatUtils.mult3d(MatUtils.translated3d(0, 0, -2), MatUtils.rotated3d("x", -Math.PI / 2));
        const plane2Mat = MatUtils.mult3d(MatUtils.translated3d(0, 0, 0), MatUtils.rotated3d("x", -Math.PI / 2));

        this.lightSystem.setModels({
            plane1: {
                uniforms: {
                    color: [1, 1, 1, 0.5],
                    mats: {
                        model: plane1Mat,
                        final: MatUtils.mult3d(this.mats.scene, plane1Mat),
                    },
                },
                render: this.shapes.plane1.render,
            },
            plane2: {
                uniforms: {
                    color: [0.5, 0.5, 0.5, 1],
                    mats: {
                        model: plane2Mat,
                        final: MatUtils.mult3d(this.mats.scene, plane2Mat),
                    },
                },
                render: this.shapes.plane2.render,
            },
        });

        this.lightSystem.renderLights();
    };
}

export default Playground;
