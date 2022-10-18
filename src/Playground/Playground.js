import PointLight from "../lights/PointLight/PointLight.js";
import Generator from "../Generator/Generator.js";
import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Plane from "../shapes/3d/Plane.js";
import SkeletonCube from "../shapes/3d/SkeletonCube.js";
import SquareCuboid from "../shapes/3d/SquareCuboid.js";
import Framer from "../Framer/Framer.js";

class Playground extends PointLight {
    constructor() {
        super({ canvasSelector: "#glFrame", pespectiveConf: { fov: Math.PI / 4, near: 1, far: 200 } });

        this.#initData();
    }

    #geometry;

    async #initData() {
        // const generator = (this = new PhongLight(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const cube = new Cube(0.2, wireframe);
        const geometry = (this.#geometry = { plane, cube });

        // const cameraPosition = [Math.cos(-Math.PI / 3.5) * 6, 0, Math.sin(-Math.PI / 3.5) * 6];
        const cameraPosition = [Math.cos(0) * 8, 0.5, Math.sin(0) * 8];
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
                lightPerspectiveMat: MatUtils.perspective(Math.PI / 2, 1, 0.1, lFar),
            },
            {
                light: {
                    ambientColor: [0, 0, 0],
                    lightColor: [1, 1, 1],
                    shininess: 1024,
                    far: lFar,
                    cameraPosition,
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
        const lPos = [Math.cos(0) * 6, 0, Math.sin(0) * 6];

        this.lightForDepthMap(lPos);

        const planeMat = MatUtils.multMats3d(this.#geometry.plane.mat, [
            MatUtils.translated3d(-10, 1.25, 2),
            MatUtils.rotated3d("y", -Math.PI / 2),
            MatUtils.rotated3d("x", -Math.PI / 2),
            MatUtils.scaled3d(6, 6, 6),
        ]);

        const cubeMat = MatUtils.multMats3d(MatUtils.translated3d(-3, -0.5, -0.5), [
            // MatUtils.init3dRotationMat("x", -Math.PI / 2),
            MatUtils.scaled3d(10, 10, 10),
        ]);

        this.renderDepthMap([
            { mat: planeMat, render: this.#renderPlane },
            { mat: cubeMat, render: this.#renderCube },
        ]);

        this.program.uniforms.modelMat = planeMat;
        this.program.uniforms.normalMat = MatUtils.normal3d(planeMat);
        this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, planeMat);
        this.program.uniforms.color = [1, 1, 1];

        this.setLight();
        this.#renderPlane();

        this.program.uniforms.modelMat = cubeMat;
        this.program.uniforms.normalMat = MatUtils.normal3d(cubeMat);
        this.program.uniforms.finalMat = MatUtils.multMats3d(this.mats.scene, cubeMat);
        this.program.uniforms.color = [0, 0, 1];
        this.setLight();
        this.#renderCube();
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
