import MatUtils from "../../../utils/MatUtils.js";

class Light {
    constructor(conf, initialUniforms) {
        this.projection.mats.proj = MatUtils.perspective(conf.projection.fov, conf.projection.aspectRatio, conf.projection.near, conf.projection.far);
        if (initialUniforms) this.setUniforms(initialUniforms);
    }

    active = true;
    projection = { mats: {} };
    #uniforms = {};

    setUniforms(uniforms) {
        Object.assign(this.#uniforms, uniforms);
    }

    getUniforms() {
        return this.#uniforms;
    }
}

export default Light;
