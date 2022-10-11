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

        // const lightPosition = [Math.cos(Math.PI / 2 + Math.PI / 8) * 5, 0, Math.sin(Math.PI / 2 + Math.PI / 8) * 5];
        // const cameraPosition = lightPosition;
        const cameraPosition = [Math.cos(Math.PI / 2) * 10, 0, Math.sin(Math.PI / 2) * 10];
        const viewMat = MatUtils.init3dInvertedMat(MatUtils.lookAtMat(cameraPosition));
        const lFar = 100;

        this.mats.scene = MatUtils.mult3dMats(this.mats.projection, [viewMat]);
        this.mats.view = viewMat;
        this.mats.light = { projection: MatUtils.initPerspectiveMat(Math.PI / 2, 1, 0.1, lFar) };

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
                    light: {
                        ambientColor: [0, 0, 0],
                        lightColor: [1, 1, 1],
                        shininess: 256,
                        far: lFar,
                        cameraPosition,
                    },
                    depthMap: {
                        far: lFar,
                    },
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
                    name: "depthMap",
                    settings: {
                        width: 25,
                        height: 25,
                        internalFormat: this.gl.DEPTH_COMPONENT32F,
                        format: this.gl.DEPTH_COMPONENT,
                        type: this.gl.FLOAT,
                        bindTarget: this.gl.TEXTURE_2D,
                        texTarget: this.gl.TEXTURE_2D,
                    },
                    setParams: () => {
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    },
                },
                // {
                //     name: "depthCubeMap",
                //     settings: {
                //         cubeMap: true,
                //         width: 100,
                //         height: 100,
                //         internalFormat: this.gl.DEPTH_COMPONENT32F,
                //         format: this.gl.DEPTH_COMPONENT,
                //         type: this.gl.FLOAT,
                //         bindTarget: this.gl.TEXTURE_CUBE_MAP,
                //         texTarget: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                //     },
                //     setParams: () => {
                //         this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                //         this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                //         this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                //         this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                //     },
                // },
            ]),
        ]);

        this.createFramebufferTexture("depthMap", this.textures.depthMap.texture, {
            texTarget: this.gl.TEXTURE_2D,
            attachment: this.gl.DEPTH_ATTACHMENT,
        });

        console.log(this);

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    // renderScene = () => {
    //     const tDivider = 6;

    //     this.mats.light.cubeSides = {};

    //     const lPos = (this.uniforms.lightPosition = [
    //         Math.cos(this.animData.deltaTime / tDivider) * 10,
    //         0,
    //         Math.sin(this.animData.deltaTime / tDivider) * 10,
    //     ]);

    //     this.mats.light.cubeSides.right = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0] + 1, lPos[1], lPos[2]], [0, -1, 0])
    //     );

    //     this.mats.light.cubeSides.left = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0] - 1, lPos[1], lPos[2]], [0, -1, 0])
    //     );

    //     this.mats.light.cubeSides.top = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0], lPos[1] + 1, lPos[2]], [0, 0, 1])
    //     );

    //     this.mats.light.cubeSides.bottom = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0], lPos[1] - 1, lPos[2]], [0, 0, -1])
    //     );

    //     this.mats.light.cubeSides.front = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0], lPos[1], lPos[2] + 1], [0, -1, 0])
    //     );

    //     this.mats.light.cubeSides.back = MatUtils.mult3dMats(
    //         this.mats.light.perspective,
    //         MatUtils.lookAtMat(lPos, [lPos[0], lPos[1], lPos[2] - 1], [0, -1, 0])
    //     );

    //     const planeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
    //         MatUtils.init3dTranslationMat(-0.75, 1.25, 0),
    //         MatUtils.init3dRotationMat("x", -Math.PI / 2),
    //         MatUtils.init3dScaleMat(4, 4, 4),
    //     ]);

    //     const cubeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
    //         MatUtils.init3dTranslationMat(-0.75, 1.25, 1),
    //         MatUtils.init3dRotationMat("x", -Math.PI / 2),
    //         MatUtils.init3dScaleMat(2, 2, 2),
    //     ]);

    //     this.gl.useProgram(this.program.depthMap.program);
    //     this.gl.viewport(0, 0, this.textures.top.settings.width, this.textures.top.settings.height);

    //     const cubeSides = Object.keys(this.textures);

    //     for (const side of cubeSides) {
    //         const fb = this.framebuffers[side];
    //         const lightMat = this.mats.light.cubeSides[side];

    //         this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);

    //         this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(lightMat, planeMat));
    //         this.#renderPlane();

    //         this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalLightMat, false, MatUtils.mult3dMats(lightMat, cubeMat));
    //         this.#renderPlane();
    //     }

    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    //     this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //     for (const side of cubeSides) {
    //         const tex = this.textures[side];

    //         this.gl.activeTexture(this.gl[`TEXTURE${tex.unit}`]);
    //         // this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, tex);

    //         this.uniforms.depthMap = tex.texture;

    //         this.uniforms.modelMat = planeMat;
    //         this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
    //         this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
    //         this.uniforms.color = [1, 1, 1];

    //         this.setLight();
    //         this.#renderPlane();

    //         this.uniforms.modelMat = cubeMat;
    //         this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat));
    //         this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat);
    //         this.uniforms.color = [0, 0, 1];

    //         this.setLight();
    //         this.#renderPlane();
    //     }

    //     // this.uniforms.modelMat = planeMat;
    //     // this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
    //     // this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
    //     // this.uniforms.color = [1, 1, 1];
    //     // this.setLight();
    //     // this.#renderPlane();

    //     // this.uniforms.modelMat = cubeMat;
    //     // this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat));
    //     // this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat);
    //     // this.uniforms.color = [0, 0, 1];
    //     // this.setLight();
    //     // this.#renderCube();
    // };

    renderScene = () => {
        const tDivider = 10;

        this.mats.light.cubeSides = {};

        console.log("render");

        // const lPos = (this.uniforms.lightPosition = [
        //     Math.cos(this.animData.deltaTime / tDivider) * 10,
        //     0,
        //     Math.sin(this.animData.deltaTime / tDivider) * 10,
        // ]);

        const lPos = (this.uniforms.lightPosition = [Math.cos(Math.PI / 2) * 10, 0, Math.sin(Math.PI / 2) * 10]);
        const lDir = [0, 0, 0];

        const lightMat = (this.mats.light.view = MatUtils.mult3dMats(
            this.mats.light.projection,
            MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, lDir))
            // MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [0, 0, 0]))
        ));

        const planeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
            MatUtils.init3dTranslationMat(-0.75, 1.25, 0),
            MatUtils.init3dRotationMat("x", -Math.PI / 2),
            MatUtils.init3dScaleMat(4, 4, 4),
        ]);

        const cubeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
            MatUtils.init3dTranslationMat(-0.75, 1.25, 1),
            MatUtils.init3dRotationMat("x", -Math.PI / 2),
            MatUtils.init3dScaleMat(2, 2, 2),
        ]);

        this.gl.viewport(0, 0, this.textures.depthMap.settings.width, this.textures.depthMap.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.depthMap);

        this.program.depthMap.uniforms.lightPosition = lPos;

        this.program.depthMap.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
        this.program.depthMap.uniforms.modelMat = planeMat;
        this.setDepthMap()
        this.#renderPlane();

        this.program.depthMap.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat)
        this.program.depthMap.uniforms.modelMat = cubeMat
        this.setDepthMap()
        this.#renderPlane();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        // this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // this.gl.activeTexture(this.gl[`TEXTURE${this.textures.depthMap.unit}`]);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.depthMap.texture);

        // this.uniforms.lightMat = MatUtils.mult3dMats(lightMat, planeMat);
        this.uniforms.depthMap = this.textures.depthMap.texture;

        this.uniforms.modelMat = planeMat;
        this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
        this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
        this.uniforms.color = [1, 1, 1];

        this.setLight();
        this.#renderPlane();

        this.uniforms.lightMat = MatUtils.mult3dMats(lightMat, cubeMat);
        this.uniforms.modelMat = cubeMat;
        this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat));
        this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat);
        this.uniforms.color = [0, 0, 1];

        this.setLight();
        this.#renderPlane();

        // this.uniforms.modelMat = planeMat;
        // this.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
        // this.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
        // this.uniforms.color = [1, 1, 1];
        // this.setLight();
        // this.#renderPlane();

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
