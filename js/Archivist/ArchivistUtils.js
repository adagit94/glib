class ArchivistUtils {
  static getHeadData() {
    // PYRAMIDS

    const coordinates = new Float32Array([
      // TRIANGLE TOP MIDDLE VERTEX
      0, 0.6, 0,

      // TRIANGLE BOTTOM MIDDLE VERTEX
      0, -0.6, 0,
      
      // SQUARE FRONT LEFT VERTEX
      -0.3, 0, 0.3,

      // SQUARE FRONT RIGHT VERTEX
      0.3, 0, 0.3,

      // SQUARE BACK RIGHT VERTEX
      0.3, 0, -0.3,

      // SQUARE BACK LEFT VERTEX
      -0.3, 0, -0.3,
    ]);

    const indices = new Uint16Array([
      // TOP FRONT TRIANGLE
      0, 2, 3,

      // TOP RIGHT TRIANGLE
      0, 3, 4,

      // TOP BACK TRIANGLE
      0, 4, 5,

      // TOP LEFT TRIANGLE
      0, 2, 5,


      // BOTTOM FRONT TRIANGLE
      1, 2, 3,

      // BOTTOM RIGHT TRIANGLE
      1, 3, 4,

      // BOTTOM BACK TRIANGLE
      1, 4, 5,

      // BOTTOM LEFT TRIANGLE
      1, 2, 5,
    ])

    return {
      coordinates,
      indices
    }
  }

  static getTentaclesData(tentaclesData, animate, animData) {
    const longerTentacleVerticesCount = 100
    const shorterTentacleVerticesCount = longerTentacleVerticesCount / 2

    const longerTentacleAngle = Math.PI / 8
    const shorterTentacleAngle = Math.PI / 4
    
    let tentacles = {
      topLeftTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
      },
      topRightTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
      },
      bottomRightTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
      },
      bottomLeftTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        move: {
          tMults: [
            {
              valToChangeName: "xPowResultDivider",
              tMultName: "xResultDividerTMult",
              startChangeBorder: 95,
              tMultStep: 0.001,
              valOp: "+",
              tMultOp: "+",
              borderOp: "<=",
            },
            {
              valToChangeName: "yPowResultDivider",
              tMultName: "yResultDividerTMult",
              startChangeBorder: 100,
              tMultStep: 0.001,
              valOp: "+",
              tMultOp: "+",
              borderOp: "<=",
            }
          ]
        }
      }
    }
    
    tentacles = Object.entries(tentacles)

    for (const tentacle of tentacles) {
      const [location, data] = tentacle
      const {coordinates, vertices, angle, move, tMults} = data
      const isLeftTentacle = location.includes("Left")
      
      let moveData = tentaclesData.move[location]

      for (
        let vertex = 1, poweredX = Math.exp((vertices - vertex + 1) / moveData.xPowDivider) / moveData.xPowResultDivider,
        poweredY = Math.exp(vertex / moveData.yPowDivider) / moveData.yPowResultDivider;
        vertex <= vertices;
        vertex++,
        poweredX += Math.exp((vertices - vertex + 1) / moveData.xPowDivider) / moveData.xPowResultDivider,
        poweredY += Math.exp(vertex / moveData.yPowDivider) / moveData.yPowResultDivider
        ) {
        let x = Math.cos(angle) * poweredX;
        const y = Math.sin(angle) * poweredY;
        const z = poweredY / 3;

        if (isLeftTentacle) x *= -1

        coordinates.push(x, y, z);
      }

      if (animate && move) {
        for (const tMult of tMults) {
          const shouldChangeTMult = Function("currentVal", "borderVal", `return currentVal ${tMult.borderOp} borderVal`)

          if (shouldChangeTMult(moveData[tMult.valToChangeName], tMult.startChangeBorder)) {
            const getChangedTMult = Function("tMult", "tMultStep", `return tMult ${tMult.tMultOp} tMultStep`)

            moveData[tMult.tMultName] = getChangedTMult(moveData[tMult.tMultName], tMult.tMultStep)
          }
          
          const getNewVal = Function("frameDeltaT", "valToChange", "tMult", `return valToChange ${tMult.valOp} frameDeltaT * tMult`)
          
          moveData[tMult.valToChangeName] = getNewVal(animData.frameDeltaTime, moveData[tMult.valToChangeName], moveData[tMult.tMultName])
        }
      }
    }

    tentacles = tentacles.map(([_, data]) => data)

    return tentacles
  }
}

export default ArchivistUtils;
