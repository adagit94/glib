import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Plane from "../shapes/3d/Plane.js";
import Framer from "../Framer/Framer.js";
import LightSystem from "../LightSystem/LightSystem.js";

class Playground extends Framer {
    constructor() {
        super({
            canvasSelector: "#glFrame",
            pespectiveConf: { fov: Math.PI / 4, near: 1, far: 200 },
        });

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const cube = new Cube(0.2, wireframe);

        let { geometry } = this;

        geometry.plane = plane;
        geometry.cube = cube;

        this.init({
            buffers: {
                plane: {
                    vertices: geometry.plane.vertices,
                    indices: geometry.plane.indices,
                    normals: geometry.plane.normals,
                    textureCoords: geometry.plane.textureCoords,
                },
                cube: {
                    vertices: geometry.cube.vertices,
                    indices: geometry.cube.indices,
                    normals: geometry.cube.normals,
                    textureCoords: geometry.cube.textureCoords,
                },
            },
        });

        // const cameraPosition = [0, 0, 0];
        const cameraPosition = [Math.cos(Math.PI / 2) * 1, 0.1, Math.sin(Math.PI / 2) * 1];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, -1]); // [-7, 1.25, 2]
        const lNear = 0.1;
        const lFar = 30;

        this.mats.scene = MatUtils.multMats3d(this.mats.projection, [viewMat]);
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
                    color: [1, 1, 1],
                    ambientColor: [0, 0, 0],
                    lightColor: [1, 0, 0],
                    shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 5),
                    innerLimit: Math.cos(Math.PI / 25),
                    distanceLin: 0.01,
                    distanceQuad: 0.0125,
                },
                depthMap: {
                    far: lFar,
                },
            }
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
                    color: [1, 1, 1],
                    ambientColor: [0, 0, 0],
                    lightColor: [0, 0, 1],
                    shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    outerLimit: Math.cos(Math.PI / 5),
                    innerLimit: Math.cos(Math.PI / 25),
                    distanceLin: 0.01,
                    distanceQuad: 0.0125,
                },
                depthMap: {
                    far: lFar,
                },
            }
        );

        this.animate = false;
        this.requestAnimationFrame();
        console.log(this);
    }

    renderScene = () => {
        const tDivider = 8;
        const firstSpotLight = this.lightSystem.getLight("first");
        const secondSpotLight = this.lightSystem.getLight("second");

        const planeMats = [
            MatUtils.multMats3d(this.geometry.plane.mat, [
                MatUtils.translated3d(-2.5, 2.4, -7.5),
                MatUtils.rotated3d("x", -Math.PI / 2),
                MatUtils.scaled3d(6, 6, 6),
            ]),
            MatUtils.multMats3d(this.geometry.plane.mat, [
                MatUtils.translated3d(0, -2.4, 16),
                MatUtils.rotated3d("x", Math.PI / 2),
                MatUtils.scaled3d(6, 6, 6),
            ]),
        ];
        const cubeMats = [
            MatUtils.multMats3d(MatUtils.translated3d(0, 0, -10), [MatUtils.scaled3d(10, 10, 10)]),
            MatUtils.multMats3d(MatUtils.translated3d(0, 0, 10), [MatUtils.scaled3d(10, 10, 10)]),
        ];

        // const lPos = [Math.cos(Math.PI / 8) * 16, 0, Math.sin(Math.PI / 8) * 16];;

        const lPos = [Math.cos(Math.PI / 2) * 1, 0.1, Math.sin(Math.PI / 2) * 1];
        const lDir = [0, 0, -1];

        firstSpotLight.setSettings({ position: lPos, direction: lDir });
        secondSpotLight.setSettings({ position: lPos, direction: lDir });

        this.lightSystem.setModels({
            plane: {
                mats: {
                    model: planeMats[0],
                    final: MatUtils.multMats3d(this.mats.scene, planeMats[0]),
                },
                render: this.#renderPlane,
            },
        });
        this.lightSystem.renderLights();
    };

    #renderPlane = () => {
        this.gl.bindVertexArray(this.buffers.plane.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.plane.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.geometry.plane.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };

    #renderCube = () => {
        this.gl.bindVertexArray(this.buffers.cube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.cube.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.geometry.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
