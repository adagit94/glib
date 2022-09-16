class Light {
    constructor(gl, conf) {
        this.gl = gl;
        this.uniformsSources = {
            finalMat: conf.finalMat,
            color: conf.color,
            objectToLightMat: conf.objectToLightMat,
            lightPosition: conf.lightPosition,
            lightColor: conf.lightColor,
        };
    }

    gl;
    program;
    locations;
    uniformsSources;

    init = async (paths) => {
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
        this.locations = {
            position: this.gl.getAttribLocation(program, "a_position"),
            normal: this.gl.getAttribLocation(program, "a_normal"),
            finalMat: this.gl.getUniformLocation(program, "u_finalMat"),
            color: this.gl.getUniformLocation(program, "u_color"),
            objectToLightMat: this.gl.getUniformLocation(program, "u_objectToLightMat"),
            lightPosition: this.gl.getUniformLocation(program, "u_lightPosition"),
            lightColor: this.gl.getUniformLocation(program, "u_lightColor"),
        };
    };

    setUniforms() {
        this.gl.uniformMatrix4fv(this.locations.finalMat, false, this.uniformsSources.finalMat);
        this.gl.uniform3f(this.locations.color, ...this.uniformsSources.color);
        this.gl.uniform3f(this.locations.lightPosition, ...this.uniformsSources.lightPosition);
        this.gl.uniform3f(this.locations.lightColor, ...this.uniformsSources.lightColor);
        this.gl.uniformMatrix4fv(this.locations.objectToLightMat, false, this.uniformsSources.objectToLightMat);
    }

    getPositionLocation() {
        return this.locations.position;
    }

    getNormalLocation() {
        return this.locations.normal;
    }

    renderLight = () => {
        this.gl.useProgram(this.program);
        this.setUniforms();
    };
}

export default Light;
