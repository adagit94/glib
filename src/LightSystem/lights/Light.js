class Light {
    constructor(conf, initialUniforms) {
        const { depthMap: depthMapUniforms, ...lightUniforms } = initialUniforms;

        this.uniforms = { ...lightUniforms, depthMap: depthMapUniforms ?? {},};
        this.projectionMat = conf.projectionMat;
    }

    uniforms;
    projectionMat;
    active = true;
}

export default Light;
