import Generator from "../Generator.js";

class Framer extends Generator {
    constructor(conf) {
        super(conf);
    }

    animate = false;
    animData;

    requestAnimationFrame() {
        this.animData = {
            frameDeltaTime: 0,
            deltaTime: 0,
            lastFrameTime: 0,
        };

        window.requestAnimationFrame(this.#render);
    }

    #render = () => {
        const now = Date.now() / 1000;
        const elapsedTime = this.animData.lastFrameTime === 0 ? 0 : now - this.animData.lastFrameTime;

        this.animData.lastFrameTime = now;
        this.animData.frameDeltaTime = elapsedTime;
        this.animData.deltaTime += elapsedTime;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.renderScene();

        if (this.animate) window.requestAnimationFrame(this.#render);
    };
}

export default Framer;
