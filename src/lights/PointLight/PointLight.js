import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(conf) {
        super(conf);
    }

    async init(conf, depthMapConf, initialUniforms) {
        await super.init("PointLight", conf, depthMapConf, initialUniforms);

        const { depthMap } = this.program;

        Object.assign(depthMap.locations, {
            modelMat: this.gl.getUniformLocation(depthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(depthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(depthMap.program, "u_far"),
        });
        depthMap.texture = this.createTexture({
            name: "depthMap",
            settings: {
                cubeMap: true,
                width: depthMapConf.size,
                height: depthMapConf.size,
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
        });
        depthMap.framebuffer = this.createFramebuffer({
            name: "depthMap",
            bindTexture: () => {
                this.gl.framebufferTexture2D(
                    this.gl.FRAMEBUFFER,
                    this.gl.DEPTH_ATTACHMENT,
                    this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    depthMap.texture.texture,
                    0
                );
            },
        });

        this.program.uniforms.depthMap = depthMap.texture.unit;
    }

    lightForDepthMap = (position) => {
        const { depthMap, uniforms } = this.program;

        uniforms.lightPosition = depthMap.uniforms.lightPosition = position;
        depthMap.light.viewMats = [];

        // x+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] + 1, position[1], position[2]], [0, -1, 0]))
        );

        // x-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0] - 1, position[1], position[2]], [0, -1, 0]))
        );

        // y+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] + 1, position[2]], [0, 0, 1]))
        );

        // y-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1] - 1, position[2]], [0, 0, -1]))
        );

        // z+
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] + 1], [0, -1, 0]))
        );

        // z-
        depthMap.light.viewMats.push(
            MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, [position[0], position[1], position[2] - 1], [0, -1, 0]))
        );
    };

    renderModelsToDepthMap = (models) => {
        const { depthMap } = this.program;

        for (let side = 0; side < 6; side++) {
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                depthMap.texture.texture,
                0
            );

            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            const lightMat = depthMap.light.viewMats[side];

            for (const model of models) {
                depthMap.uniforms.finalLightMat = MatUtils.multMats3d(lightMat, model.mat);
                depthMap.uniforms.modelMat = model.mat;

                this.setDepthMap();
                model.render();
            }
        }
    };

    setDepthMapUniforms() {
        super.setDepthMapUniforms();

        this.gl.uniformMatrix4fv(this.program.depthMap.locations.modelMat, false, this.program.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.program.depthMap.locations.lightPosition, ...this.program.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.program.depthMap.locations.far, this.program.depthMap.uniforms.far);
    }
}

export default PointLight;
