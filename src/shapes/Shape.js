class Shape {
    constructor(name, ctx, init, wireframe) {
        this.ctx = ctx;
        this.gl = ctx.gl;
        this.wireframe = wireframe;

        const { mats, ...geometryData } = init()

        this.mats = mats ?? {}
        this.geometryData = geometryData
        this.buffers = ctx.createBufferSet({
            data: geometryData
        }, false)
        
        ctx.shapes[name] = this
    }

    ctx;
    gl;
    wireframe;
    geometryData
    mats

    bindVao() {
        this.gl.bindVertexArray(this.buffers.vao);
    }

    drawArrays(mode, offset = 0) {
        this.gl.drawArrays(mode, offset, this.geometryData.vertices.length);
    };

    drawElements(mode, offset = 0) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        this.gl.drawElements(mode, this.geometryData.indices.length, this.gl.UNSIGNED_SHORT, offset);
    };
}

export default Shape;