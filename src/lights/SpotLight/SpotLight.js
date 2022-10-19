import MatUtils from "../../utils/MatUtils.js";
import Light from "../Light.js";

class SpotLight extends Light {
    constructor(conf) {
        super(conf);
    }

    async init(conf, depthMapConf, initialUniforms) {
        await super.init(
            "SpotLight",
            conf,
            depthMapConf,
            initialUniforms,
        );

        this.program.locations.finalLightMat = this.gl.getUniformLocation(this.program.program, "u_finalLightMat");

        const { depthMap } = this.program;

        depthMap.texture = this.createTexture({
            name: "depthMap",
            settings: {
                width: depthMapConf.size,
                height: depthMapConf.size,
                internalFormat: this.gl.DEPTH_COMPONENT32F,
                format: this.gl.DEPTH_COMPONENT,
                type: this.gl.FLOAT,
                bindTarget: this.gl.TEXTURE_2D,
                texTarget: this.gl.TEXTURE_2D,
            },
            setParams: () => {
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            },
        });
        depthMap.framebuffer = this.createFramebuffer({
            name: "depthMap",
            bindTexture: () => {
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, depthMap.texture.texture, 0);
            },
        });

        this.program.uniforms.depthMap = depthMap.texture.unit;
    }

    lightForDepthMap = (position, target) => {
        const { depthMap, uniforms } = this.program;

        uniforms.lightPosition = position;
        depthMap.light.viewMat = MatUtils.multMats3d(depthMap.light.projectionMat, MatUtils.view3d(position, target))
    };
    
    renderModelsToDepthMap = (models) => {
        const { depthMap } = this.program;
        
        for (const model of models) {
            depthMap.uniforms.lightFinalMat = MatUtils.multMats3d(depthMap.light.viewMat, model.mat);

            this.setDepthMap();
            model.render();
        }
    };
}

export default SpotLight;
