import PhongLight from "../lights/PhongLight/PhongLight.js";
import Generator from "../Generator/Generator.js";
import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Plane from "../shapes/3d/Plane.js";
import SkeletonCube from "../shapes/3d/SkeletonCube.js";
import SquareCuboid from "../shapes/3d/SquareCuboid.js";
import Framer from "../Framer/Framer.js";

class Playground extends Framer {
    constructor() {
        super("#glFrame");

        this.#initData();
    }

    #generator;
    #geometry;

    async #initData() {
        // const generator = (this.#generator = new PhongLight(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));
        const generator = (this.#generator = new Generator(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const geometry = (this.#geometry = plane);

        const cameraPosition = [0, 0, 1];
        // const cameraPosition = [Math.cos(Math.PI / 2 + Math.PI / 4) * 3, 0, Math.sin(Math.PI / 2 + Math.PI / 8) * 4];
        const viewMat = MatUtils.init3dInvertedMat(MatUtils.lookAtMat(cameraPosition));

        generator.mats.scene = MatUtils.mult3dMats(generator.mats.projection, viewMat);

        // Promise.all([
        //     generator.init(
        //         {
        //             geometry: {
        //                 vertices: geometry.vertices,
        //                 indices: geometry.indices,
        //                 // normals: geometry.normals,
        //                 textureCoords: geometry.textureCoords,
        //             },
        //         },
        //         {
        //             ambientColor: [1, 1, 1],
        //             color: [1, 1, 1],
        //             lightPosition: [0, 0, 3],
        //             lightColor: [0, 0, 0],
        //             cameraPosition,
        //             shininess: 256,
        //         }
        //     ),
        //     generator.createTexture("lightImg", "/print-screens/angle/rotation-y-gradient.png"),
        // ]);

        await Promise.all([
            generator.init([
                {
                    name: "playground",
                    paths: {
                        vShader: "src/Playground/playground.vert",
                        fShader: "src/Playground/playground.frag",
                    },
                    buffersData: {
                        geometry: {
                            vertices: geometry.vertices,
                            indices: geometry.indices,
                            // normals: geometry.normals,
                            textureCoords: geometry.textureCoords,
                        },
                    },
                },
            ]),
            generator.createTexture("lightImg", "/print-screens/angle/rotation-y-gradient.png"),
        ]);

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    renderScene = () => {
        const backPlaneMat = MatUtils.mult3dMats(
            MatUtils.init3dTranslationMat(-0.4, 0.4, -0.4),
            MatUtils.init3dRotationMat("x", -Math.PI / 2)
        );
        // const frontPlaneMat = MatUtils.mult3dMats(MatUtils.init3dScaleMat(0.5, 0.5, 1), [
        //     MatUtils.init3dTranslationMat(-0.4, 0.4, 0),
        //     MatUtils.init3dRotationMat("x", -Math.PI / 2),
        // ]);

        this.gl.useProgram(this.#generator.programs.playground.program);
        this.gl.bindVertexArray(this.#generator.programs.playground.buffers.geometry.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#generator.programs.playground.buffers.geometry.indices);

        this.gl.uniform3f(this.#generator.programs.playground.locations.color, 1, 0, 0);
        this.gl.uniformMatrix4fv(this.#generator.programs.playground.locations.finalMat, false, MatUtils.mult3dMats(this.#generator.mats.scene, backPlaneMat));

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // this.#generator.uniforms.color = [1, 0, 0]
        // this.#generator.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, backPlaneMat);
        // this.#generator.uniforms.modelMat = backPlaneMat;
        // this.#generator.uniforms.normalMat = MatUtils.init3dNormalMat(backPlaneMat);

        // this.#generator.setLight();

        // this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // this.#generator.uniforms.color = [0, 1, 0]
        // this.#generator.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, frontPlaneMat);
        // this.#generator.uniforms.modelMat = frontPlaneMat;
        // this.#generator.uniforms.normalMat = MatUtils.init3dNormalMat(frontPlaneMat);

        // this.#generator.setLight();

        // this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
