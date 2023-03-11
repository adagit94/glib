import VecUtils from "../../../utils/VecUtils.js";
import Shape from "../../Shape.js";
import ShapeUtils from "../../ShapeUtils.js";

class TriangularPlane extends Shape {
    // cc - circumscribed circle
    // ic - inscribed circle
    constructor(ctx, ccR, triColors, optionals) {
        super(ctx, { ...(optionals?.uniforms ?? {}), useBufferColor: true }, () => {
            let vertices = [],
                normals = [],
                indices = [],
                colors = [];

            let verticesForAngle = [];
            let fluidIndices = [0, 1, 2];
            const normal = [0, 0, 1];

            const angleStep = (Math.PI * 2) / 6;
            const angleOffset = Math.PI / 2;
            const icR = -Math.sin(angleOffset + angleStep * 2) * ccR;

            for (let i = 0; i < 6; i++) {
                const angle = angleOffset + angleStep * i;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                let verticesGroup = { ic: [cos * icR, sin * icR, 0] };
                if (i % 2 === 0) verticesGroup.cc = [cos * ccR, sin * ccR, 0];

                verticesForAngle.push(verticesGroup);
            }

            const setTriangleGroupData = (verticesToAdd, color) => {
                ShapeUtils.setGeometryData(
                    [vertices, verticesToAdd],
                    [normals, normal, false, true],
                    [indices, fluidIndices, true],
                    [colors, color, true]
                );
            };

            setTriangleGroupData([verticesForAngle[1].ic, verticesForAngle[3].ic, verticesForAngle[5].ic], triColors.inscribed);

            setTriangleGroupData(
                [verticesForAngle.at(-1).ic, verticesForAngle.at(0).cc, verticesForAngle.at(0).ic],
                triColors.groups[0][0]
            );
            setTriangleGroupData([verticesForAngle.at(1).ic, verticesForAngle.at(0).cc, verticesForAngle.at(0).ic], triColors.groups[0][1]);
            setTriangleGroupData([verticesForAngle.at(-1).ic, verticesForAngle.at(0).ic, verticesForAngle.at(1).ic], triColors.groups[0][2]);

            setTriangleGroupData([verticesForAngle.at(1).ic, verticesForAngle.at(2).ic, verticesForAngle.at(2).cc], triColors.groups[1][0]);
            setTriangleGroupData([verticesForAngle.at(2).cc, verticesForAngle.at(2).ic, verticesForAngle.at(3).ic], triColors.groups[1][1]);
            setTriangleGroupData([verticesForAngle.at(1).ic, verticesForAngle.at(2).ic, verticesForAngle.at(3).ic], triColors.groups[1][2]);

            setTriangleGroupData([verticesForAngle.at(3).ic, verticesForAngle.at(4).ic, verticesForAngle.at(4).cc], triColors.groups[2][0]);
            setTriangleGroupData([verticesForAngle.at(4).cc, verticesForAngle.at(4).ic, verticesForAngle.at(5).ic], triColors.groups[2][1]);
            setTriangleGroupData([verticesForAngle.at(3).ic, verticesForAngle.at(4).ic, verticesForAngle.at(5).ic], triColors.groups[2][2]);

            return { vertices, indices, normals, colors };
        });

        this.transpose = false;
    }
}

export default TriangularPlane;
