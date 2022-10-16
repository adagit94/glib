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
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 1, far: 200 });

        this.#initData();
    }

    #geometry;

    async #initData() {
        // const generator = (this = new PhongLight(this.gl, this.aspectRatio, { fov: Math.PI / 4, near: 0.1, far: 100 }));

        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);
        const cube = new Cube(0.2, wireframe);
        const geometry = (this.#geometry = { plane, cube });

        const cameraPosition = [Math.cos(-Math.PI / 4) * 6, 0, Math.sin(-Math.PI / 4) * 6];
        // const cameraPosition = [Math.cos(0) * 8, 0.5, Math.sin(0) * 8];
        const viewMat = MatUtils.init3dInvertedMat(MatUtils.lookAtMat(cameraPosition, [0, 0, 0])); // [-7, 1.25, 2]
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
                // {
                //     name: "depthMap",
                //     settings: {
                //         width: 25,
                //         height: 25,
                //         internalFormat: this.gl.DEPTH_COMPONENT32F,
                //         format: this.gl.DEPTH_COMPONENT,
                //         type: this.gl.FLOAT,
                //         bindTarget: this.gl.TEXTURE_2D,
                //         texTarget: this.gl.TEXTURE_2D,
                //     },
                //     setParams: () => {
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                //         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                //     },
                // },
                {
                    name: "depthMap",
                    settings: {
                        cubeMap: true,
                        width: 800,
                        height: 800,
                        internalFormat: this.gl.DEPTH_COMPONENT32F,
                        format: this.gl.DEPTH_COMPONENT,
                        type: this.gl.FLOAT,
                        bindTarget: this.gl.TEXTURE_CUBE_MAP,
                        texTarget: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    },
                    setParams: () => {
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_COMPARE_MODE, this.gl.COMPARE_REF_TO_TEXTURE);
                    },
                },
            ]),
        ]);

        this.createFramebuffer("depthMap", () => {
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                this.textures.depthMap.texture,
                0
            );
        });

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        console.log(this);
        this.requestAnimationFrame();
    }

    renderScene = () => {
        const tDivider = 8;

        this.mats.light.cubeSides = [];

        // const lPos = (this.program.depthMap.uniforms.lightPosition = this.program.uniforms.lightPosition = [0, 0, 0]);
        const lPos = (this.program.depthMap.uniforms.lightPosition = this.program.uniforms.lightPosition = [Math.sin(Math.PI / 2 - this.animData.deltaTime / tDivider) * 5, 0, Math.cos(Math.PI / 2 - this.animData.deltaTime / tDivider) * 5]);
        // const lPos =
        //     (this.program.depthMap.uniforms.lightPosition =
        //     this.program.uniforms.lightPosition =
        //         [
        //             Math.cos(Math.PI / 2 - this.animData.deltaTime / tDivider) * 5,
        //             0,
        //             Math.sin(Math.PI / 2 - this.animData.deltaTime / tDivider) * 5,
        //         ]);

        // right
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0] + 1, lPos[1], lPos[2]], [0, -1, 0]))
            )
        );

        // left
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0] - 1, lPos[1], lPos[2]], [0, -1, 0]))
            )
        );

        // top
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0], lPos[1] + 1, lPos[2]], [0, 0, 1]))
            )
        );

        // bottom
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0], lPos[1] - 1, lPos[2]], [0, 0, -1]))
            )
        );

        // front
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0], lPos[1], lPos[2] + 1], [0, -1, 0]))
            )
        );

        // back
        this.mats.light.cubeSides.push(
            MatUtils.mult3dMats(
                this.mats.light.projection,
                MatUtils.init3dInvertedMat(MatUtils.lookAtMat(lPos, [lPos[0], lPos[1], lPos[2] - 1], [0, -1, 0]))
            )
        );

        const planeMat = MatUtils.mult3dMats(this.#geometry.plane.mat, [
            MatUtils.init3dTranslationMat(-10, 1.25, 2),
            MatUtils.init3dRotationMat("y", -Math.PI / 2),
            MatUtils.init3dRotationMat("x", -Math.PI / 2),
            MatUtils.init3dScaleMat(6, 6, 6),
        ]);

        const cubeMat = MatUtils.mult3dMats(MatUtils.init3dTranslationMat(-3, -0.5, -0.5), [
            // MatUtils.init3dRotationMat("x", -Math.PI / 2),
            MatUtils.init3dScaleMat(6, 6, 6),
        ]);

        this.gl.viewport(0, 0, this.textures.depthMap.settings.width, this.textures.depthMap.settings.height);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.depthMap);

        for (let side = 0; side < 6; side++) {
            const lightMat = this.mats.light.cubeSides[side];

            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                this.textures.depthMap.texture,
                0
            );

            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);


            this.program.depthMap.uniforms.finalMat = MatUtils.mult3dMats(lightMat, planeMat);
            this.program.depthMap.uniforms.modelMat = planeMat;
            this.setDepthMap();
            this.#renderPlane();

            this.program.depthMap.uniforms.finalMat = MatUtils.mult3dMats(lightMat, cubeMat);
            this.program.depthMap.uniforms.modelMat = cubeMat;
            this.setDepthMap();
            this.#renderCube();
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // this.gl.activeTexture(this.gl[`TEXTURE0`]);
        // this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures.depthMap.texture);
        this.program.uniforms.depthMap = this.textures.depthMap.unit;

        this.program.uniforms.modelMat = planeMat;
        this.program.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(planeMat));
        this.program.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, planeMat);
        this.program.uniforms.color = [1, 1, 1];

        this.setLight();
        this.#renderPlane();

        this.program.uniforms.modelMat = cubeMat;
        this.program.uniforms.normalMat = MatUtils.init3dTransposedMat(MatUtils.init3dInvertedMat(cubeMat));
        this.program.uniforms.finalMat = MatUtils.mult3dMats(this.mats.scene, cubeMat);
        this.program.uniforms.color = [0, 0, 1];

        this.setLight();
        // this.#renderPlane();
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
