class Light {
    constructor(ctx, initialUniforms, conf) {
        const { depthMap: depthMapConf, alphaMap: alphaMapConf, ...lightConf } = conf;
        const { depthMap: depthMapUniforms, alphaMap: alphaMapUniforms, ...lightUniforms } = initialUniforms;

        this.gl = ctx.gl;
        this.uniforms = lightUniforms;
        this.projectionMat = lightConf.projectionMat;

        const texBindTarget = lightConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
        const texTarget = lightConf.cubeMap ? this.gl.TEXTURE_CUBE_MAP_POSITIVE_X : this.gl.TEXTURE_2D;

        if (alphaMapConf) {
            this.alphaMap = {
                uniforms: alphaMapUniforms,
                texture: ctx.createTexture(
                    {
                        settings: {
                            width: alphaMapConf.size,
                            height: alphaMapConf.size,
                            internalFormat: this.gl.ALPHA,
                            format: this.gl.ALPHA,
                            type: this.gl.UNSIGNED_BYTE,
                            bindTarget: texBindTarget,
                            texTarget,
                        },
                        setParams: () => {
                            this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                            this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                            this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                            this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                            // this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                            // this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                            // this.gl.texParameteri(texBindTarget, this.gl.TEXTURE_COMPARE_MODE, this.gl.COMPARE_REF_TO_TEXTURE);
                        },
                    },
                    null,
                    false
                ),
            };
            this.alphaMap.framebuffer = ctx.createFramebuffer(
                {
                    setTexture: () => {
                        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.ALPHA, texTarget, this.alphaMap.texture.texture, 0);
                    },
                },
                false
            );
            this.uniforms.alphaMap = this.alphaMap.texture.unit;
        } else if (depthMapConf) {
            this.depthMap = {
                uniforms: depthMapUniforms,
                texture: ctx.createTexture(
                    {
                        settings: {
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
                    null,
                    false
                ),
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
    }

    gl;
    uniforms;
    depthMap;
    alphaMap;
    active = true;
}

export default Light;
