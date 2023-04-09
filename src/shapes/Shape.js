import Magnetism from "../effects/magnetism/Magnetism.js";
import MatUtils from "../utils/MatUtils.js";
import ShapeUtils from "./ShapeUtils.js";

class Shape {
    constructor(ctx, initialUniforms, init) {
        this.ctx = ctx;
        this.gl = ctx.gl;
        this.#geometryData = init(this);
        this.#geometryData.initialData = {
            vertices: this.#geometryData.vertices,
            normals: this.#geometryData.normals,
            indices: this.#geometryData.indices,
        };
        this.#buffers = ctx.createBufferSet({
            data: this.#geometryData,
        });
        this.#effects = { magnetism: new Magnetism(this) };

        if (initialUniforms) this.setUniforms(initialUniforms);
    }

    ctx;
    gl;
    position;
    layer;
    active = true;
    sortTriangles = true;
    perVertexOps = false;
    mats = { origin: MatUtils.identity3d(), effect: MatUtils.identity3d(), offset: MatUtils.identity3d(), orientation: MatUtils.identity3d() };
    #effects;
    #geometryData;
    #buffers;
    #uniforms = { modelMat: MatUtils.identity3d() };

    getUniforms() {
        return this.#uniforms;
    }

    setUniforms(uniforms) {
        if (Object.prototype.hasOwnProperty.call(uniforms, "modelMat")) {
            this.perVertexOps ? delete uniforms.modelMat : this.setPosition(uniforms.modelMat);
        }

        Object.assign(this.#uniforms, uniforms);
    }

    getPosition(mat) {
        return mat.slice(12, 15);
    }

    setPosition(mat) {
        return (this.position = this.getPosition(mat));
    }

    getBuffers() {
        return this.#buffers;
    }

    getGeometryData() {
        return this.#geometryData;
    }

    getEffect(type) {
        return this.#effects[type];
    }

    // setEffect(type) {
    //     return this.#effects[type]
    // }

    #defaultVertexHandler = vertex => MatUtils.multVertWithMats3d(vertex, this.mats.offset);

    transposeVertices = (vertexHandler = this.#defaultVertexHandler) => {
        let farthestVertices = [[], [], []];

        const newVerticesCoords = (this.#geometryData.vertices = ShapeUtils.redefineCoords(this.#geometryData.vertices, (vertex, vertexI) => {
            const transposedVert = vertexHandler(vertex, vertexI);
            ShapeUtils.handleFarthestVertices(farthestVertices, transposedVert);
            return transposedVert;
        }));
        const newNormalsCoords = (this.#geometryData.normals = ShapeUtils.computeTrianglesNormals(
            this.#geometryData.initialData.normals,
            newVerticesCoords
        ));

        this.position = ShapeUtils.getCuboidCenterFromFarthestVertices(farthestVertices);

        this.ctx.redefineBufferData(this.gl.ARRAY_BUFFER, this.#buffers.vertices, newVerticesCoords);
        this.ctx.redefineBufferData(this.gl.ARRAY_BUFFER, this.#buffers.normals, newNormalsCoords);
    };

    #getCoordsSets = firstCoordI => ({
        vertex: this.#geometryData.vertices.slice(firstCoordI, firstCoordI + 3),
        normal: this.#geometryData.normals.slice(firstCoordI, firstCoordI + 3),
    });

    #positionCoordsSets = firstCoordI => {
        const sets = this.#getCoordsSets(firstCoordI);

        return {
            vertex: MatUtils.multVertWithMats3d(sets.vertex, this.#uniforms.modelMat),
            normal: MatUtils.multVertWithMats3d(sets.normal, this.#uniforms.modelMat),
        };
    };

    sortIndices(refPoint) {
        const sortedIndices = (this.#geometryData.indices = ShapeUtils.sortTriangleIndices(
            refPoint,
            this.#geometryData.indices,
            this.perVertexOps ? this.#getCoordsSets : this.#positionCoordsSets,
            this.invertNormals ? "desc" : "asc"
        ));

        this.ctx.redefineBufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices, sortedIndices);
    }

    render = () => {
        this.gl.bindVertexArray(this.#buffers.vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);
        this.gl.drawElements(this.gl.TRIANGLES, this.#geometryData.indices.length, this.gl.UNSIGNED_SHORT, 0);
    };
}

export default Shape;
