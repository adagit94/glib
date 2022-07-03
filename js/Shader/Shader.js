import ShaderUtils from './ShaderUtils.js';

export default class Shader {
  static #shaderFetchConf = {
    mode: 'same-origin',
    method: 'GET',
  };

  static setCanvasDimensions() {
    const gl = document.querySelector('#glFrame').getContext('webgl2');

    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
  }

  gl = document.querySelector('#glFrame').getContext('webgl2');
  projectionMat = ShaderUtils.init2dProjectionMat(
    this.gl.canvas.width,
    this.gl.canvas.height
  );
  aspectRatio = this.gl.canvas.width / this.gl.canvas.height
  animData = {
    frameDeltaTime: 0,
    deltaTime: 0,
    prevAnimTime: 0,
  };

  initShaders = async shadersData => {
    let shadersFetches = [];

    Object.values(shadersData).forEach(({ vShader, fShader }) => {
      shadersFetches.push(fetch(vShader, Shader.#shaderFetchConf));
      shadersFetches.push(fetch(fShader, Shader.#shaderFetchConf));
    });

    let shadersSources = await Promise.all(shadersFetches);

    shadersSources = await Promise.all(shadersSources.map(res => res.text()));

    let programs = [];

    for (let i = 0; i < shadersSources.length; i += 2) {
      const vShaderStr = shadersSources[i];
      const fShaderStr = shadersSources[i + 1];

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

      programs.push(program);
    }

    return programs;
  };

  initCommonLocations(programs) {
    let locations = [];

    for (const program of programs) {
      locations.push({
        position: this.gl.getAttribLocation(program, 'a_position'),
        mat: this.gl.getUniformLocation(program, 'u_mat'),
      });
    }

    return locations;
  }

  createAndBindVerticesBuffer(
    attrLocation,
    bufferData,
    settings,
    drawMethod = this.gl.STATIC_DRAW
  ) {
    const buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, drawMethod);
    this.gl.enableVertexAttribArray(attrLocation);
    this.gl.vertexAttribPointer(
      attrLocation,
      settings.size,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    return buffer;
  }

  createAndBindElementsBuffer(bufferData, drawMethod = this.gl.STATIC_DRAW) {
    const buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, bufferData, drawMethod);

    return buffer;
  }

  #triggerFrame = t => this.renderScene(t);

  requestAnimationFrame = () =>
    window.requestAnimationFrame(this.#triggerFrame);

  renderScene(timeNow) {
    const timeInSecs = timeNow / 1000;
    const deltaTime = timeInSecs - this.animData.prevAnimTime;

    this.animData.prevAnimTime = timeInSecs;
    this.animData.frameDeltaTime = deltaTime;
    this.animData.deltaTime += deltaTime;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}

Shader.setCanvasDimensions();
