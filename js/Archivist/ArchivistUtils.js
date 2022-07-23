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

  static initTentaclesData() {
    const longerTentacleVerticesCount = 100;
    const shorterTentacleVerticesCount = longerTentacleVerticesCount / 2;

    const longerTentacleAngle = Math.PI / 8;
    const shorterTentacleAngle = Math.PI / 4;
    
    let data = {
      topLeftTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 16,
        yResultDividerTMult: 32,
        currentMove: 0,
        moves: []
      },
      topRightTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 16,
        yResultDividerTMult: 32,
        currentMove: 0,
        moves: []
      },
      bottomRightTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 16,
        yResultDividerTMult: 32,
        currentMove: 0,
        moves: []
      },
      bottomLeftTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 64,
        yResultDividerTMult: 128,
        currentMove: 0,
        moves: [
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 145,
                tMultFinish: 0.1,
                tFactor: 1.0175,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 150,
                tMultFinish: 0.1,
                tFactor: 1.0175,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
        ],
      },
    };

    data = Object.entries(data)

    let tentaclesMoves = data.map(tentacle => tentacle[1].moves)

    for (const tentacleMoves of tentaclesMoves) {
      for (const tentacleMove of tentacleMoves) {
        let { tMults } = tentacleMove

        for (let tMult of tMults) {
          tMult.shouldChangeTMult = Function("currentVal", "borderVal", `return currentVal ${tMult.borderOp} borderVal`)
          tMult.getChangedTMult = Function("tMult", "tFactor", `return tMult ${tMult.tMultOp} tFactor`)
          tMult.getNewVal = Function("frameDeltaT", "valToChange", "tMult", `return valToChange ${tMult.valOp} frameDeltaT * tMult`)
          tMult.tMultFinishReached = Function("tMult", "tMultFinish", `return tMult ${tMult.finishOp} tMultFinish`)
        }
      }
    }

    return data
  }
  
  static computeTentaclesData(tentacles, animate, animData) {
    for (let tentacle of tentacles) {
      const [location, data] = tentacle
      const {vertices, angle, currentMove, moves} = data
      const isLeftTentacle = location.includes("Left")

      let coordinates = data.coordinates = []
      
      for (
        let vertex = 1, poweredX = Math.exp((vertices - vertex + 1) / data.xPowDivider) / data.xPowResultDivider,
        poweredY = Math.exp(vertex / data.yPowDivider) / data.yPowResultDivider;
        vertex <= vertices;
        vertex++,
        poweredX += Math.exp((vertices - vertex + 1) / data.xPowDivider) / data.xPowResultDivider,
        poweredY += Math.exp(vertex / data.yPowDivider) / data.yPowResultDivider
        ) {
        let x = Math.cos(angle) * poweredX;
        const y = Math.sin(angle) * poweredY;
        const z = poweredY / 3;

        if (isLeftTentacle) x *= -1

        coordinates.push(x, y, z);
      }

      if (animate) {
        const move = moves?.[currentMove]

        if (move) {
          let shouldAdvanceResults = [];
          
          for (const tMult of move.tMults) {
            if (tMult.shouldChangeTMult(data[tMult.valToChangeName], tMult.startChangeBorder)) {
              data[tMult.tMultName] = Math.max(tMult.getChangedTMult(data[tMult.tMultName], tMult.tFactor), 0)
            }
            
            data[tMult.valToChangeName] = Math.max(tMult.getNewVal(animData.frameDeltaTime, data[tMult.valToChangeName], data[tMult.tMultName]), 0)

            if (Object.prototype.hasOwnProperty.call(tMult, "tMultFinish")) {
              shouldAdvanceResults.push(tMult.tMultFinishReached(data[tMult.tMultName], tMult.tMultFinish))
            }
          }

          const shouldAdvance = shouldAdvanceResults.length && shouldAdvanceResults.every(res => res)
          
          if (shouldAdvance) data.currentMove++
        }
      }
    }

    tentacles = tentacles.map(([_, data]) => data)

    return tentacles
  }
}

export default ArchivistUtils;
