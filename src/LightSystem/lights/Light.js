class Light {
    constructor(conf, initialUniforms) {
        const { depthMap: depthMapUniforms, lightIntensityMap: lightIntensityMapUniforms, ...lightUniforms } = initialUniforms;

        this.uniforms = { ...lightUniforms, depthMap: depthMapUniforms, lightIntensityMap: lightIntensityMapUniforms };
        this.projectionMat = conf.projectionMat;
    }

    uniforms;
    projectionMat;
    active = true;
}

export default Light;
