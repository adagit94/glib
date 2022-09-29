import PhongLight from "../Lights/PhongLight/PhongLight.js";
import Shader from "../Shader/Shader.js";
import ShaderUtils from "../Shader/ShaderUtils.js";
import Cube from "../Shapes/3d/Cube.js";
import Hexagon from "../Shapes/3d/Hexagon/Hexagon.js";
import Plane from "../Shapes/3d/Plane.js";
import SkeletonCube from "../Shapes/3d/SkeletonCube.js";
import SquareCuboid from "../Shapes/3d/SquareCuboid.js";

class Playground extends Shader {
    constructor() {
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 0.1, far: 100 }); // fov: Math.PI / 4, near: 0.1, far: 100 - typical params

        this.#initData();
    }

    #light;
    #geometry;

    async #initData() {
        const wireframe = false;
        const plane = new Plane(0.8, 1, 1, wireframe);

        const geometry = (this.#geometry = plane);

        const cameraPosition = [0, 0, 1];
        // const cameraPosition = [Math.cos(Math.PI / 2 + Math.PI / 4) * 3, 0, Math.sin(Math.PI / 2 + Math.PI / 8) * 4];
        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat);

        const light = (this.#light = new PhongLight(this.gl, {
            ambientColor: [1, 1, 1],
            color: [1, 1, 1],
            lightPosition: [0, 0, 3],
            lightColor: [0, 0, 0],
            cameraPosition,
            shininess: 256,
        }));

        await light.init();
        await this.init([
            {
                name: "playground",
                paths: { vShader: "js/Playground/playground.vert", fShader: "js/Playground/playground.frag" },
                buffersData: {
                    geometry: {
                        vertices: geometry.vertices,
                        indices: geometry.indices,
                        // normals: geometry.normals,
                        textureCoords: geometry.textureCoords,
                    },
                },
            },
        ]);

        await this.createTexture("lightImg", "/print-screens/angle/rotation-y-gradient.png");

        this.animate = false;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame()
    }

    renderScene = () => {
        const backPlaneMat = ShaderUtils.mult3dMats(
            ShaderUtils.init3dTranslationMat(-0.4, 0.4, -0.4),
            ShaderUtils.init3dRotationMat("x", -Math.PI / 2)
        );
        // const frontPlaneMat = ShaderUtils.mult3dMats(ShaderUtils.init3dScaleMat(0.5, 0.5, 1), [
        //     ShaderUtils.init3dTranslationMat(-0.4, 0.4, 0),
        //     ShaderUtils.init3dRotationMat("x", -Math.PI / 2),
        // ]);


        this.gl.useProgram(this.programs.playground.program);
        this.gl.bindVertexArray(this.programs.playground.buffers.geometry.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.geometry.indices);

        // this.gl.uniform3f(this.programs.playground.locations.color, 1, 0, 0);
        this.gl.uniformMatrix4fv(this.programs.playground.locations.mat, false, ShaderUtils.mult3dMats(this.mats.scene, backPlaneMat));

        this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // this.#light.uniforms.color = [1, 0, 0]
        // this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, backPlaneMat);
        // this.#light.uniforms.modelMat = backPlaneMat;
        // this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(backPlaneMat);

        // this.#light.setLight();

        // this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // this.#light.uniforms.color = [0, 1, 0]
        // this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, frontPlaneMat);
        // this.#light.uniforms.modelMat = frontPlaneMat;
        // this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(frontPlaneMat);

        // this.#light.setLight();

        // this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Playground;
