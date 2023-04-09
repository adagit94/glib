import AngleUtils from "../../../utils/AngleUtils.js";
import MatUtils from "../../../utils/MatUtils.js";
import Cylinder from "../Cylinder.js";
import Sphere from "../Sphere.js";

class TetrahedronSkelet {
    static #VERTICES_DENSITY_BASE = 100;

    constructor(ctx, conf) {
        const edgeLength = Math.sqrt(2) * conf.cubeSideLength;
        let scaledConf = structuredClone(conf);

        scaledConf.vertex.r *= conf.scale;
        scaledConf.edge.middle.r *= conf.scale;
        scaledConf.edge.side.r *= conf.scale;
        scaledConf.edge.length = edgeLength;
        scaledConf.edge.segmentLength = (edgeLength - scaledConf.vertex.r * 2) / 3;
        scaledConf.verticesDensity = Math.round(TetrahedronSkelet.#VERTICES_DENSITY_BASE * conf.scale);

        delete scaledConf.scale;

        this.#ctx = ctx;
        this.#conf = scaledConf;

        this.#positionVertices();
        this.#positionEdges();
        this.#positionShape();
    }

    #ctx;
    #conf;
    #shapes = [];

    getShapes() {
        return this.#shapes;
    }

    transform(mat, shapes = this.#shapes) {
        for (const shape of shapes) {
            const { modelMat } = shape.getUniforms();

            shape.setUniforms({ modelMat: MatUtils.mult3d(mat, modelMat) });
        }

        return shapes;
    }

    #positionVertices() {
        const { cubeSideLength } = this.#conf;

        this.#positionVertex({
            x: -cubeSideLength / 2,
            y: cubeSideLength / 2,
            z: cubeSideLength / 2,
        });

        this.#positionVertex({
            x: cubeSideLength / 2,
            y: -cubeSideLength / 2,
            z: cubeSideLength / 2,
        });

        this.#positionVertex({
            x: cubeSideLength / 2,
            y: cubeSideLength / 2,
            z: -cubeSideLength / 2,
        });

        this.#positionVertex({
            x: -cubeSideLength / 2,
            y: -cubeSideLength / 2,
            z: -cubeSideLength / 2,
        });
    }

    #positionVertex(position) {
        this.#shapes.push(this.#createSphere(this.#conf.vertex, position));
    }

    #createSphere(part, position) {
        const r = part.r;
        const mat = MatUtils.translated3d(position.x, position.y, position.z);
        const sectorsDensity = this.#conf.verticesDensity;
        const stacksDensity = Math.round(sectorsDensity / 2);

        return new Sphere(this.#ctx, r, stacksDensity, sectorsDensity, {
            uniforms: {
                color: part.color,
                modelMat: mat,
            },
        });;
    }

    #positionEdges() {
        const { edge } = this.#conf;

        {
            const shape = this.#shapes[0];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("z", Math.PI / 4),
                    MatUtils.translated3d(edge.length / 2, 0, 0),
                ]),
            );
        }

        {
            const shape = this.#shapes[1];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("y", Math.PI / 2),
                    MatUtils.rotated3d("z", Math.PI / 4),
                    MatUtils.translated3d(-edge.length / 2, 0, 0),
                ]),
            );
        }

        {
            const shape = this.#shapes[2];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("z", -Math.PI / 4),
                    MatUtils.translated3d(-edge.length / 2, 0, 0),
                ])
            );
        }

        {
            const shape = this.#shapes[3];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("y", Math.PI / 2),
                    MatUtils.rotated3d("z", -Math.PI / 4),
                    MatUtils.translated3d(edge.length / 2, 0, 0),
                ])
            );
        }

        {
            const shape = this.#shapes[1];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("y", Math.PI / 4),
                    MatUtils.translated3d(-edge.length / 2, 0, 0),
                ])
            );
        }

        {
            const shape = this.#shapes[0];

            this.#positionEdge(
                MatUtils.mult3d(MatUtils.translated3d(...shape.position), [
                    MatUtils.rotated3d("y", -Math.PI / 4),
                    MatUtils.translated3d(edge.length / 2, 0, 0),
                ])
            );
        }
    }

    #positionEdge(mat) {
        this.#shapes.push(...this.transform(mat, this.#createEdge()));
    }

    #createEdge() {
        return [
            this.#createCylinder(this.#conf.edge.side, -1),
            this.#createCylinder(this.#conf.edge.middle),
            this.#createCylinder(this.#conf.edge.side, 1),
        ];
    }

    #createCylinder(segment, offsetPolarity) {
        const { edge, verticesDensity } = this.#conf;

        const h = edge.segmentLength;
        const r = segment.r;

        let mat = MatUtils.rotated3d("z", -Math.PI / 2);
        if (offsetPolarity !== undefined) {
            MatUtils.translate3d(mat, { y: h * offsetPolarity });
        }

        return new Cylinder(this.#ctx, r, h, verticesDensity, {
            uniforms: {
                color: segment.color,
                modelMat: mat,
            },
        });
    }

    #positionShape() {
        this.transform(MatUtils.mult3d(MatUtils.rotated3d("z", AngleUtils.degToRad(60)), MatUtils.rotated3d("y", Math.PI / 4)));
    }
}

export default TetrahedronSkelet;
