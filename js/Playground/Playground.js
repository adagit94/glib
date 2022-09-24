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
        super("#glFrame", "3d", { fov: Math.PI / 4, near: 1, far: 5 });

        this.#initData();
    }

    #light;
    #geometry;

    async #initData() {
        const wireframe = false;
        // const geometry = new Plane(0.1, 4, 4, wireframe);
        const geometry = new SkeletonCube(0.5, 0.125, wireframe);

        this.#geometry = geometry;

        const cameraPosition = [0, 0, 2];
        const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition));

        this.mats.scene = ShaderUtils.mult3dMats(this.mats.projection, viewMat); // Math.PI / 2

        const light = (this.#light = new PhongLight(this.gl, {
            ambientColor: [0, 0, 0],
            color: [0, 0, 1],
            lightPosition: [0, 0, 2],
            lightColor: [1, 1, 1],
            cameraPosition,
            shininess: 256,
        }));

        await light.init();
        await this.init([
            {
                name: "playground",
                paths: { vShader: "js/Playground/playground.vert", fShader: "js/Playground/playground.frag" },
                buffersData: {
                    cuboid: {
                        vertices: [light.locations.position, geometry.cuboid.vertices],
                        indices: geometry.cuboid.indices,
                        normals: [light.locations.normal, geometry.cuboid.normals],
                    },
                    cube: {
                        vertices: [light.locations.position, geometry.cube.vertices],
                        indices: geometry.cube.indices,
                        normals: [light.locations.normal, geometry.cube.normals],
                    },
                },
            },
        ]);

        this.animate = true;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(1);

        this.requestAnimationFrame();
    }

    computeScene = () => {
        // const modelMat = ShaderUtils.init3dRotationMat("x", this.animData.deltaTime / 2);
        // const modelMat = ShaderUtils.init3dRotationMat("y", -Math.PI / 8);
        // const modelMat = ShaderUtils.init3dRotationMat("y", 0);

        // const modelMat = ShaderUtils.mult3dMats(ShaderUtils.init3dTranslationMat(0, 0, -0.5), [
        //     ShaderUtils.init3dRotationMat("y", -Math.PI / 32),
        //     // ShaderUtils.init3dRotationMat("x", -Math.PI / 2),
        // ]);

        const { mats } = this.#geometry;
        let sceneMat = ShaderUtils.mult3dMats(this.mats.scene, ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 4))
        // let sceneMat = ShaderUtils.mult3dMats(this.mats.scene, ShaderUtils.init3dRotationMat("x", 0))

        this.gl.bindVertexArray(this.programs.playground.buffers.cuboid.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.cuboid.indices);

        const rotationMat = ShaderUtils.init3dRotationMat("y", this.animData.deltaTime / 4)
        
        for (const cuboidMat of mats.cuboids) {
            const modeMat = ShaderUtils.mult3dMats(rotationMat, cuboidMat);
            
            this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modeMat);
            this.#light.uniforms.modelMat = modeMat;
            this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modeMat);

            this.#light.setLight();

            this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.cuboid.indices.length, this.gl.UNSIGNED_SHORT, 0);
        }

        this.gl.bindVertexArray(this.programs.playground.buffers.cube.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.playground.buffers.cube.indices);

        for (const cubeMat of mats.cubes) {
            const modeMat = ShaderUtils.mult3dMats(rotationMat, cubeMat);

            this.#light.uniforms.finalMat = ShaderUtils.mult3dMats(this.mats.scene, modeMat);
            this.#light.uniforms.modelMat = modeMat;
            this.#light.uniforms.normalMat = ShaderUtils.init3dNormalMat(modeMat);

            this.#light.setLight();

            this.gl.drawElements(this.gl.TRIANGLES, this.#geometry.cube.indices.length, this.gl.UNSIGNED_SHORT, 0);
        }
    };
}

export default Playground;
