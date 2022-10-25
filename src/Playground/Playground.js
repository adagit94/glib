import PointLight from "../lights/PointLight/PointLight.js";
import Generator from "../Generator/Generator.js";
import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Plane from "../shapes/3d/Plane.js";
import SkeletonCube from "../shapes/3d/SkeletonCube.js";
import SquareCuboid from "../shapes/3d/SquareCuboid.js";
import Framer from "../Framer/Framer.js";
import SpotLight from "../lights/SpotLight/SpotLight.js";

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
        const cameraPosition = [Math.cos(0) * 32, 0, Math.sin(0) * 32];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, 0]); // [-7, 1.25, 2]
        const lNear = 1;
        const lFar = 30;

        this.mats.scene = MatUtils.multMats3d(this.mats.projection, [viewMat]);
        this.lights.spot = {
            first: new SpotLight(
                this,
                "first",
                {
                    size: 800,
                    lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
                },
                {
                    light: {
                        ambientColor: [1, 1, 1],
                        lightColor: [0, 0, 0],
                        shininess: 1024,
                        far: lFar,
                        cameraPosition,
                        outerLimit: Math.cos(Math.PI / 12),
                        innerLimit: Math.cos(Math.PI / 14),
                        distanceLin: 0.01,
                        distanceQuad: 0.0125,
                    },
                    depthMap: {
                        far: lFar,
                    },
                }
            ),
            // second: new SpotLight(
            //     this,
            //     "second",
            //     {
            //         size: 800,
            //         lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, lNear, lFar),
            //     },
            //     {
            //         light: {
            //             ambientColor: [1, 0, 0],
            //             lightColor: [0, 0, 0],
            //             shininess: 1024,
            //             far: lFar,
            //             cameraPosition,
            //             outerLimit: Math.cos(Math.PI / 2),
            //             innerLimit: Math.cos(Math.PI / 4),
            //             distanceLin: 0.01,
            //             distanceQuad: 0.0125,
            //         },
            //         depthMap: {
            //             far: lFar,
            //         },
            //     }
            // ),
        };

        this.animate = false;
        this.requestAnimationFrame();
    }

    renderScene = () => {
        const tDivider = 8;
        const lPos = [0, 0, 0];
        const { first: firstSpotLight, second: secondSpotLight } = this.lights.spot;

        // const lPos = [Math.cos(Math.PI / 8) * 16, 0, Math.sin(Math.PI / 8) * 16];;

        firstSpotLight.lightForDepthMap({ position: lPos, direction: [0, 0, -1] });
        // firstSpotLight.lightForDepthMap(lPos);

        const planeMats = [
            MatUtils.multMats3d(this.geometry.plane.mat, [
                MatUtils.translated3d(0, 2.4, -16),
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

        firstSpotLight.renderDepthMap([
            { mat: planeMats[0], render: this.#renderPlane },
            { mat: planeMats[1], render: this.#renderPlane },
            { mat: cubeMats[0], render: this.#renderCube },
            { mat: cubeMats[1], render: this.#renderCube },
        ]);

        firstSpotLight.uniforms.modelMat = planeMats[0];
        firstSpotLight.uniforms.normalMat = MatUtils.normal3d(planeMats[0]);
        firstSpotLight.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, planeMats[0]);
        firstSpotLight.uniforms.finalLightMat = MatUtils.multMats3d(firstSpotLight.depthMap.light.viewMat, planeMats[0]);
        firstSpotLight.uniforms.color = [1, 1, 1];

        firstSpotLight.setLight();
        this.#renderPlane();

        firstSpotLight.uniforms.modelMat = planeMats[1];
        firstSpotLight.uniforms.normalMat = MatUtils.normal3d(planeMats[1]);
        firstSpotLight.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, planeMats[1]);
        firstSpotLight.uniforms.finalLightMat = MatUtils.multMats3d(firstSpotLight.depthMap.light.viewMat, planeMats[1]);
        firstSpotLight.uniforms.color = [1, 1, 1];

        firstSpotLight.setLight();
        this.#renderPlane();

        firstSpotLight.uniforms.modelMat = cubeMats[0];
        firstSpotLight.uniforms.normalMat = MatUtils.normal3d(cubeMats[0]);
        firstSpotLight.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, cubeMats[0]);
        firstSpotLight.uniforms.finalLightMat = MatUtils.multMats3d(firstSpotLight.depthMap.light.viewMat, cubeMats[0]);
        firstSpotLight.uniforms.color = [0, 0, 1];
        firstSpotLight.setLight();
        this.#renderCube();

        firstSpotLight.uniforms.modelMat = cubeMats[1];
        firstSpotLight.uniforms.normalMat = MatUtils.normal3d(cubeMats[1]);
        firstSpotLight.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, cubeMats[1]);
        firstSpotLight.uniforms.finalLightMat = MatUtils.multMats3d(firstSpotLight.depthMap.light.viewMat, cubeMats[1]);
        firstSpotLight.uniforms.color = [0, 0, 1];
        firstSpotLight.setLight();
        this.#renderCube();

        console.log(this);
        console.log(this.lights);
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
