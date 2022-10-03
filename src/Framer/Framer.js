import Generator from "../Generator/Generator.js";

class Framer extends Generator {
    constructor(canvasSelector, mode, perspectiveConf) {
        super(canvasSelector, mode, perspectiveConf)
    }

    animate = false;
    animData;

    requestAnimationFrame() {
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