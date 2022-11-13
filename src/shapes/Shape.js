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

    drawArrays(mode, settings) {
        this.bindVao()
        this.gl.drawArrays(mode, settings?.offset ?? 0, settings?.count ?? this.geometryData.vertices.length / (this.ctx.mode === "3d" ? 3 : 2));
    };

    drawElements(mode, settings) {
        this.bindVao()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        this.gl.drawElements(mode, settings?.count ?? this.geometryData.indices.length, this.gl.UNSIGNED_SHORT, settings?.offset ?? 0);
    };
}

export default Shape;