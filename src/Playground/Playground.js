import PhongLight from "../lights/PhongLight/PhongLight.js";
import Generator from "../Generator/Generator.js";
import MatUtils from "../utils/MatUtils.js";
import Cube from "../shapes/3d/Cube.js";
import Hexagon from "../shapes/3d/Hexagon/Hexagon.js";
import Plane from "../shapes/3d/Plane.js";
import SkeletonCube from "../shapes/3d/SkeletonCube.js";
import SquareCuboid from "../shapes/3d/SquareCuboid.js";
import Framer from "../Framer/Framer.js";

class Playground extends PhongLight {
    constructor() {
        super("#glFrame");

        this.#initData();
    }

    #geometry;

    async #initData() {
        // const generator = (this = new PhongLight(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const cube = new Cube(0.2, wireframe);
        const geometry = (this.#geometry = { plane, cube });

        const cameraPosition = [0, 0, 2];
        // const cameraPosition = [Math.cos(Math.PI / 2 + Math.PI / 4) * 3, 0, Math.sin(Math.PI / 2 + Math.PI / 8) * 4];
        const viewMat = MatUtils.init3dInvertedMat(MatUtils.lookAtMat(cameraPosition));

        this.mats.scene = MatUtils.mult3dMats(this.mats.projection, [viewMat, MatUtils.init3dRotationMat("y", -Math.PI / 4)]); // MatUtils.init3dRotationMat("y", Math.PI / 6)
        this.mats.light = MatUtils.mult3dMats(MatUtils.initPerspectiveMat(Math.PI / 4, 1, 1, 100), MatUtils.lookAtMat([-2.5, 2, 4], [0, 0, 0]));

        await Promise.all([
            this.init([
                {
                    plane: {
                        vertices: geometry.plane.vertices,
                        indices: geometry.plane.indices,
                        normals: geometry.normals,
                        textureCoords: geometry.plane.textureCoords,
                    },
                    cube: {
                        vertices: geometry.cube.vertices,
                        indices: geometry.cube.indices,
                        normals: geometry.normals,
                        textureCoords: geometry.textureCoords,
                    },
                },
                {
                    ambientColor: [0, 0, 0],
                    color: [1, 1, 1],
                    lightPosition: [0, 0, 3],
                    lightColor: [0, 0, 1],
                    cameraPosition,
                    shininess: 256,
                },
            ]),
            this.createTextures([
                // {
                //     name: "angle",
                //     path: "/print-screens/angle/rotation-y-gradient.png",
                //     setParams: () => {
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR); // surface area < texture
                //         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // surface area > texture
                //     },
                // },
                // {
                //     name: "light",
                //     path: "/print-screens/light/triangular.png",
                //     setParams: () => {
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR); // surface area < texture
                //         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // surface area > texture
                //     },
                // },
                {
                    name: "depth",
                    settings: {
                        width: 600,
                        height: 600,
                        internalFormat: this.gl.DEPTH_COMPONENT32F,
                        format: this.gl.DEPTH_COMPONENT,
                        type: this.gl.FLOAT,
                    },
                    setParams: () => {
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    },
                },
            ]),
        ]);

        this.createFramebufferTexture("depth", this.textures.depth.texture, { attachment: this.gl.DEPTH_ATTACHMENT });

        console.log(this);

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    renderScene = () => {
        this.gl.uniform1i(this.programs.playground.locations.texture, this.textures.light.texture);
        this.gl.uniform1i(this.programs.playground.locations.projectedTexture, this.textures.depth.texture);

        const planeMat = MatUtils.mult3dMats(MatUtils.init3dTranslationMat(-0.4, 0.4, -0.4), [
            MatUtils.init3dRotationMat("y", 0),
            MatUtils.init3dRotationMat("x", -Math.PI / 2),
        ]);

        const cubeMat = MatUtils.init3dTranslationMat(0, 0, 0.75);

        let textureMat = MatUtils.init3dIdentityMat();

        this.gl.useProgram(this.program.depthMap.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.depth);
        this.gl.viewport(0, 0, this.textures.depth.settings.width, this.textures.depth.settings.height);

        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(this.mats.light, planeMat));
        this.#renderPlane();

        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(this.mats.light, cubeMat));
        this.#renderCube();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.useProgram(this.program.program);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.depth.texture);

        textureMat = MatUtils.mult3dMats(this.mats.light.projection, [
            MatUtils.init3dInvertedMat(this.mats.light.view),
            // MatUtils.init3dTranslationMat(0, 0, 0),
        ]);

        this.gl.uniformMatrix4fv(this.program.locations.lightMat, false, this.mats.light);

        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, planeMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat)));
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, MatUtils.mult3dMats(this.mats.scene, planeMat));
        this.gl.uniform3f(this.program.locations.color, 1, 1, 1);
        this.#renderPlane();

        this.gl.uniformMatrix4fv(this.program.locations.modelMat, false, cubeMat);
        this.gl.uniformMatrix4fv(this.program.locations.normalMat, false, MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat)));
        this.gl.uniformMatrix4fv(this.program.locations.finalMat, false, MatUtils.mult3dMats(this.mats.scene, cubeMat));
        this.gl.uniform3f(this.programs.locations.color, 0, 0, 1);
        this.#renderCube();
    };

    #renderPlane() {
        this.gl.bindVertexArray(this.program.buffers.plane.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.program.buffers.plane.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.plane.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    #renderCube() {
        this.gl.bindVertexArray(this.program.buffers.cube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.program.buffers.cube.indices);

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}

export default Playground;
