class Light {
    constructor(conf, initialUniforms) {
        const { depthMap: depthMapUniforms, alphaMap: alphaMapUniforms, ...lightUniforms } = initialUniforms;

        this.uniforms = { ...lightUniforms, depthMap: depthMapUniforms, alphaMap: alphaMapUniforms };
        this.projectionMat = conf.projectionMat;
    }

    uniforms;
    projectionMat
    active = true;
}

export default Light;
