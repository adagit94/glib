import MatUtils from "../../utils/MatUtils.js";

class Light {
    constructor(ctx, depthMapConf, initialUniforms) {
        this.gl = ctx.gl;
        this.uniforms = initialUniforms.light;

        const texBindTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
        const texTarget = depthMapConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP_POSITIVE_X : this.gl.TEXTURE_2D;

        this.depthMap = {
            uniforms: initialUniforms.depthMap,
            texture: ctx.createTexture(
                {
                    settings: {
                        cubeMap: depthMapConf.cubeMap,
                        width: depthMapConf.size,
                        height: depthMapConf.size,
                        internalFormat: this.gl.DEPTH_COMPONENT32F,
                        format: this.gl.DEPTH_COMPONENT,
                        type: this.gl.FLOAT,
                        bindTarget: texBindTarget,
                        texTarget,
                    },
                    setParams: () => {
                        this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_COMPARE_MODE, this.gl.COMPARE_REF_TO_TEXTURE);
                    },
                },
                false
            ),
            light: { projectionMat: depthMapConf.lightProjectionMat },
        };
        this.depthMap.framebuffer = ctx.createFramebuffer(
            {
                setTexture: () => {
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, texTarget, this.depthMap.texture.texture, 0);
                    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
                },
            },
            false
        );
        this.uniforms.depthMap = this.depthMap.texture.unit;
    }

    gl;
    uniforms;
    depthMap;
    active = true;
}

export default Light;
