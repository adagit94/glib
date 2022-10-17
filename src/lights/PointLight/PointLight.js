import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class PointLight extends Light {
    constructor(conf) {
        super(conf);
    }

    async init(conf, depthMapConf, initialUniforms) {
        await super.init(
            {
                ...conf,
                programs: [
                    ...(conf.programs ?? []),
                    {
                        name: "light",
                        paths: {
                            vShader: "src/lights/PointLight/pointLight.vert",
                            fShader: "src/lights/PointLight/pointLight.frag",
                        },
                    },
                    {
                        name: "depthMap",
                        paths: {
                            vShader: "src/lights/pointLight/shadowMapping/depthMap.vert",
                            fShader: "src/lights/pointLight/shadowMapping/depthMap.frag",
                        },
                    },
                ],
            },
            initialUniforms
        );

        Object.assign(this.program.locations, {
            ambientColor: this.gl.getUniformLocation(this.program.program, "u_ambientColor"),
            lightPosition: this.gl.getUniformLocation(this.program.program, "u_lightPosition"),
            cameraPosition: this.gl.getUniformLocation(this.program.program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(this.program.program, "u_shininess"),
        });

        const { depthMap } = this.program;

        depthMap.locations = {
            position: depthMap.locations.position,
            finalMat: depthMap.locations.finalMat,
            modelMat: this.gl.getUniformLocation(depthMap.program, "u_modelMat"),
            lightPosition: this.gl.getUniformLocation(depthMap.program, "u_lightPosition"),
            far: this.gl.getUniformLocation(depthMap.program, "u_far"),
        };
        depthMap.light = { perspectiveMat: depthMapConf.lightPerspectiveMat };
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

    setCubeMapLightMats = (lightPosition) => {
        const { depthMap, uniforms } = this.program;

        uniforms.lightPosition = depthMap.uniforms.lightPosition = lightPosition;
        depthMap.light.mats = [];

        // x+
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0] + 1, lightPosition[1], lightPosition[2]], [0, -1, 0])
            )
        );

        // x-
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0] - 1, lightPosition[1], lightPosition[2]], [0, -1, 0])
            )
        );

        // y+
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0], lightPosition[1] + 1, lightPosition[2]], [0, 0, 1])
            )
        );

        // y-
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0], lightPosition[1] - 1, lightPosition[2]], [0, 0, -1])
            )
        );

        // z+
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0], lightPosition[1], lightPosition[2] + 1], [0, -1, 0])
            )
        );

        // z-
        depthMap.light.mats.push(
            MatUtils.multMats3d(
                depthMap.light.perspectiveMat,
                MatUtils.view3d(lightPosition, [lightPosition[0], lightPosition[1], lightPosition[2] - 1], [0, -1, 0])
            )
        );
    };

    renderCubeMapTextures = (models) => {
        const { depthMap } = this.program;

        this.gl.viewport(0, 0, depthMap.texture.settings.width, depthMap.texture.settings.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, depthMap.framebuffer);

        for (let side = 0; side < 6; side++) {
            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.DEPTH_ATTACHMENT,
                this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
                depthMap.texture.texture,
                0
            );

            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            const lightMat = depthMap.light.mats[side];

            for (const model of models) {
                depthMap.uniforms.finalMat = MatUtils.multMats3d(lightMat, model.mat);
                depthMap.uniforms.modelMat = model.mat;

                this.setDepthMap();
                model.render();
            }
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.activeTexture(this.gl[`TEXTURE${depthMap.texture.unit}`]);
    };

    setUniforms() {
        super.setUniforms();

        this.gl.uniform3f(this.program.locations.ambientColor, ...this.program.uniforms.ambientColor);
        this.gl.uniform3f(this.program.locations.lightPosition, ...this.program.uniforms.lightPosition);
        this.gl.uniform3f(this.program.locations.cameraPosition, ...this.program.uniforms.cameraPosition);
        this.gl.uniform1f(this.program.locations.shininess, this.program.uniforms.shininess);
    }

    setDepthMapUniforms() {
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.finalMat, false, this.program.depthMap.uniforms.finalMat);
        this.gl.uniformMatrix4fv(this.program.depthMap.locations.modelMat, false, this.program.depthMap.uniforms.modelMat);
        this.gl.uniform3f(this.program.depthMap.locations.lightPosition, ...this.program.depthMap.uniforms.lightPosition);
        this.gl.uniform1f(this.program.depthMap.locations.far, this.program.depthMap.uniforms.far);
    }
}

export default PointLight;
