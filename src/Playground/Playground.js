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

        // const cameraPosition = [Math.cos(Math.PI / 2.25) * 20, 0, Math.sin(Math.PI / 2.25) * 20];
        // const lightPosition = [Math.cos(Math.PI / 2 + Math.PI / 8) * 5, 0, Math.sin(Math.PI / 2 + Math.PI / 8) * 5];
        const lightPosition = [0, 0, 5];
        const cameraPosition = lightPosition;
        // const cameraPosition = [Math.cos(Math.PI / 2.25) * 20, 0, Math.sin(Math.PI / 2.25) * 20];
        const viewMat = MatUtils.init3dInvertedMat(MatUtils.lookAtMat(cameraPosition));

        this.mats.scene = MatUtils.mult3dMats(this.mats.projection, [viewMat]);
        this.mats.light = MatUtils.mult3dMats(MatUtils.initPerspectiveMat(Math.PI / 4, 1, 0.1, 100), MatUtils.lookAtMat(lightPosition, [0, 0, 0]));

        await Promise.all([
            this.init(
                {
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
                {
                    ambientColor: [0, 0, 0],
                    lightColor: [1, 1, 1],
                    shininess: 256,
                    lightPosition,
                    cameraPosition,
                }
            ),
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
                        width: 100,
                        height: 100,
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
        const planeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
            MatUtils.init3dScaleMat(4, 4, 4),
            MatUtils.init3dRotationMat("x", -Math.PI / 2),
        ]);

        const cubeMat = MatUtils.mult3dMats(MatUtils.init3dTranslationMat(1.5, -1.5, 2), [
            MatUtils.init3dScaleMat(4, 4, 4),
        ]);

        // let textureMat = MatUtils.init3dIdentityMat();

        this.gl.useProgram(this.program.depthMap.program);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.depth.texture);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.depth);
        this.gl.viewport(0, 0, this.textures.depth.settings.width, this.textures.depth.settings.height);

        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(this.mats.light, planeMat));
        this.#renderPlane();

        // this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(this.mats.light, cubeMat));
        // this.#renderCube();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // textureMat = MatUtils.mult3dMats(this.mats.light.projection, [
        //     MatUtils.init3dInvertedMat(this.mats.light.view),
        //     // MatUtils.init3dTranslationMat(0, 0, 0),
        // ]);

        this.uniforms.lightMat = this.mats.light;
        this.uniforms.depthMap = this.textures.depth.texture;

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.depth.texture);
        this.uniforms.modelMat = planeMat;
        this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
        this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
        this.uniforms.color = [1, 1, 1];
        this.setLight();
        this.#renderPlane();

        // this.uniforms.modelMat = cubeMat;
        // this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat));
        // this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat);
        // this.uniforms.color = [0, 0, 1];
        // this.setLight();
        // this.#renderCube();
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
