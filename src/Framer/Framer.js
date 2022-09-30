import Generator from "../Generator/Generator.js";
import ShaderUtils from "../utils/MatUtils.js";

class Framer {
    constructor(canvasSelector) {
        const gl = (this.gl = document.querySelector(canvasSelector).getContext("webgl2"));

        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        this.aspectRatio = gl.canvas.width / gl.canvas.height;
    }

    gl;
    aspectRatio;
    animate = false;
    animData;

    requestAnimationFrame = () => {
        this.animData = {
            frameDeltaTime: 0,
            deltaTime: 0,
            lastFrameTime: Date.now() / 1000,
        };

        window.requestAnimationFrame(this.#render);
    };

    #render = () => {
        const now = Date.now() / 1000;
        const elapsedTime = now - this.animData.lastFrameTime;

        this.animData.lastFrameTime = now;
        this.animData.frameDeltaTime = elapsedTime;
        this.animData.deltaTime += elapsedTime;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.renderScene();

        if (this.animate) window.requestAnimationFrame(this.#render);
    };
}

export default Framer