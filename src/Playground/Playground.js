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

class Playground extends SpotLight {
    constructor() {
        super({ canvasSelector: "#glFrame", pespectiveConf: { fov: Math.PI / 4, near: 1, far: 200 } });

        this.#initData();
    }

    #geometry;

    async #initData() {
        // const generator = (this = new PhongLight(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const cube = new Cube(0.20, wireframe);
        const geometry = (this.#geometry = { plane, cube });

        const cameraPosition = [Math.cos(0) * 16, 0, Math.sin(0) * 16];
        // const cameraPosition = [Math.cos(0) * 16, 0, Math.sin(0) * 16];
        const viewMat = MatUtils.view3d(cameraPosition, [0, 0, 0]); // [-7, 1.25, 2]
        const lFar = 100;

        this.mats.scene = MatUtils.multMats3d(this.mats.projection, [viewMat]);

        await this.init(
            {
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
            },
            {
                size: 800,
                lightProjectionMat: MatUtils.perspective(Math.PI / 2, 1, 0.1, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [1, 1, 1],
                    shininess: 1024,
                    far: lFar,
                    cameraPosition,
                    cosLimit: Math.cos(Math.PI / 12),
                    distanceLin: 0.01,
                    distanceQuad: 0.0125,
                },
                depthMap: {
                    far: lFar,
                },
            }
        );

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        console.log(this);
        this.requestAnimationFrame();
    }

    renderScene = () => {
        const tDivider = 8;
        // const lPos = [Math.cos(0) * 6, 0, Math.sin(0) * 6];
        const lPos = [Math.cos(0) * 5, 0, Math.sin(0) * 16];

        this.lightForDepthMap(lPos, [-1, 0, Math.sin(0) * 16]);

        const planeMats = [
            MatUtils.multMats3d(this.#geometry.plane.mat, [ 
                MatUtils.translated3d(-2.4, 2.4, -8),
                // MatUtils.rotated3d("y", -Math.PI / 2),
                MatUtils.rotated3d("x", -Math.PI / 2),
                MatUtils.scaled3d(6, 6, 6),
            ]),
            MatUtils.multMats3d(this.#geometry.plane.mat, [
                MatUtils.translated3d(-11, 5, 8),
                MatUtils.rotated3d("y", -Math.PI / 2),
                MatUtils.rotated3d("x", -Math.PI / 2),
                MatUtils.scaled3d(16, 16, 16),
            ]),
        ];

        const cubeMats = [
            MatUtils.multMats3d(MatUtils.translated3d(0, 0, -5), [
                // MatUtils.init3dRotationMat("x", -Math.PI / 2),
                MatUtils.scaled3d(10, 10, 10),
            ]),
            MatUtils.multMats3d(MatUtils.translated3d(-5, 0, -0), [
                // MatUtils.init3dRotationMat("x", -Math.PI / 2),
                MatUtils.scaled3d(10, 10, 10),
            ]),
        ];

        this.renderDepthMap([
            { mat: planeMats[0], render: this.#renderPlane },
            { mat: planeMats[1], render: this.#renderPlane },
            // { mat: cubeMats[0], render: this.#renderCube },
            // { mat: cubeMats[1], render: this.#renderCube },
        ]);

        this.program.uniforms.modelMat = planeMats[0];
        this.program.uniforms.normalMat = MatUtils.normal3d(planeMats[0]);
        this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, planeMats[0]);
        this.program.uniforms.finalLightMat = MatUtils.multMats3d(this.program.depthMap.light.viewMat, planeMats[0]);
        this.program.uniforms.color = [1, 1, 1];

        this.setLight();
        this.#renderPlane();

        this.program.uniforms.modelMat = planeMats[1];
        this.program.uniforms.normalMat = MatUtils.normal3d(planeMats[1]);
        this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, planeMats[1]);
        this.program.uniforms.finalLightMat = MatUtils.multMats3d(this.program.depthMap.light.viewMat, planeMats[1]);
        this.program.uniforms.color = [1, 1, 1];

        this.setLight();
        this.#renderPlane();

        // this.program.uniforms.modelMat = cubeMats[0];
        // this.program.uniforms.normalMat = MatUtils.normal3d(cubeMats[0]);
        // this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, cubeMats[0]);
        // this.program.uniforms.finalLightMat = MatUtils.multMats3d(this.program.depthMap.light.viewMat, cubeMats[0]);
        // this.program.uniforms.color = [0, 0, 1];
        // this.setLight();
        // this.#renderCube();

        // this.program.uniforms.modelMat = cubeMats[1];
        // this.program.uniforms.normalMat = MatUtils.normal3d(cubeMats[1]);
        // this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, cubeMats[1]);
        // this.program.uniforms.finalLightMat = MatUtils.multMats3d(this.program.depthMap.light.viewMat, cubeMats[1]);
        // this.program.uniforms.color = [0, 0, 1];
        // this.setLight();
        // this.#renderCube();
    };

    #renderPlane = () => {
        this.gl.bindVertexArray(this.buffers.plane.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.plane.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.plane.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };

    #renderCube = () => {
        this.gl.bindVertexArray(this.buffers.cube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.cube.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
