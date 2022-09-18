class Light {
    constructor(gl) {
        this.gl = gl;
    }

    gl;
    program;
    locations;
    uniforms;

    async init(paths) {
        const fetchConf = {
            mode: "same-origin",
            method: "GET",
        };

        let shadersFetches = [];

        shadersFetches.push(fetch(paths.vShader, fetchConf));
        shadersFetches.push(fetch(paths.fShader, fetchConf));

        let shadersSources = await Promise.all(shadersFetches);

        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        const vShaderStr = shadersSources[0];
        const fShaderStr = shadersSources[1];

        const vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.gl.shaderSource(vShader, vShaderStr);
        this.gl.shaderSource(fShader, fShaderStr);

        this.gl.compileShader(vShader);
        this.gl.compileShader(fShader);

        const program = this.gl.createProgram();

        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);

        this.gl.linkProgram(program);

        this.program = program;
    }

    getPositionLocation() {
        return this.locations.position;
    }

    getNormalLocation() {
        return this.locations.normal;
    }

    setLight = () => {
        this.gl.useProgram(this.program);
        this.setUniforms();
    };
}

export default Light;
