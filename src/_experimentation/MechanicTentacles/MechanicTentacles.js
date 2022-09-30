import SpotLight from "../Lights/SpotLight/SpotLight";
import Shader from "../Shader/Shader";
import ShaderUtils from "../Shader/ShaderUtils";

class MechanicTentacles extends Shader {
    constructor(shaders) {
        super("3d", { fov: Math.PI, near: 0, far: 2000 });

        this.initShaders(shaders).then((programs) => {
            const cameraPosition = [0, 0, 0];
            const targetPosition = [0, 0, 1];
            const viewMat = ShaderUtils.init3dInvertedMat(ShaderUtils.lookAtMat(cameraPosition, targetPosition));

            this.#data = {
                program: programs[0],
                mat: ShaderUtils.mult3dMats(this.projectionMat, viewMat),
                cameraPosition,
                targetPosition,
            };

            const lightConf = {
                color: [0, 0, 1],
                cameraPosition,
                lightPosition: [1, 0, 0.5],
                lightTarget: targetPosition,
                lightColor: [1, 1, 1],
                lightInnerBorder: 0,
                lightOuterBorder: Math.cos(Math.PI / 4),
                lightShininess: 1,
            };

            this.#lights = {
                spot: new SpotLight("#glFrame", lightConf, this.#spotLightFrameHandler),
            };

            this.#initLocations(programs);
            this.#initTentaclesData();

            this.animate = true;

            this.requestAnimationFrame();
        });
    }

    #data;
    #lights;

    #initTentaclesData() {}

    #spotLightFrameHandler = (uniforms) => {
        // assign mats into conf props
        // modelMat
        // normalMat
    };
}

export default MechanicTentacles;
