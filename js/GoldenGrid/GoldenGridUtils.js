class GoldenGridUtils {
    constructor() {
        super("3d", { fov: Math.PI / 2.5, near: 0, far: 2000 });

        this.initShaders({
            vShader: "js/GoldenGrid/goldenGrid.vert",
            fShader: "js/GoldenGrid/goldenGrid.frag",
        }).then((programs) => {
            const [goldenGrid] = programs;

            this.#programs = {
                goldenGrid
            }

            this.animate = false;

            this.gl.enable(this.gl.DEPTH_TEST);

            this.requestAnimationFrame();
        });
    }

    #programs;
}

export default GoldenGridUtils;
