import ShapeUtils from "./ShapeUtils.js";

class Shape {
    constructor(ctx, initialUniforms, init) {
        this.ctx = ctx;
        this.gl = ctx.gl;
        this.#geometryData = init(this);
        this.#buffers = ctx.createBufferSet({
            data: this.#geometryData,
        });
        if (initialUniforms) this.setUniforms(initialUniforms);
    }

    ctx;
    gl;
    position;
    layer;
    transpose = true;
    #geometryData;
    #buffers;
    #uniforms = {};

    getBuffers() {
        return this.#buffers;
    }

    getGeometryData() {
        return this.#geometryData;
    }

    setUniforms(uniforms) {
        Object.assign(this.#uniforms, uniforms);

        if (Object.prototype.hasOwnProperty.call(uniforms, "modelMat")) {
            this.position = uniforms.modelMat.slice(12, 15);
        }
    }

    getUniforms() {
        return this.#uniforms;
    }

    transposeTriangles(refPoint) {
        if (this.transpose) {
            this.ctx.redefineBufferData(
                this.gl.ELEMENT_ARRAY_BUFFER,
                this.#buffers.indices,
                ShapeUtils.transposeTriangleIndices(refPoint, this.#uniforms.modelMat, this.#geometryData, this.invertNormals ? "desc" : "asc")
            );
        }
    }

    render = () => {
        this.#drawElements(this.gl.TRIANGLES);
    };

    #drawElements(mode, settings) {
        this.gl.bindVertexArray(this.#buffers.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);
        this.gl.drawElements(mode, settings?.count ?? this.#geometryData.indices.length, this.gl.UNSIGNED_SHORT, settings?.offset * 2 ?? 0);
    }
}

export default Shape;
