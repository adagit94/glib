import ShaderUtils from "../../Shader/ShaderUtils.js"

class Plane {
    constructor(squareLength, rows, columns, wireframe) {
        let vertices = [], indices = [], normals = [], textureCoords = []

        const lastColOffsetForRow = squareLength * columns
        const lastRowOffsetForCol = squareLength * rows
        
        if (wireframe) {
            for (let row = 0; row <= rows; row++) {
                const rowOffset = squareLength * row
                
                vertices.push(0, 0, rowOffset)                    
                vertices.push(lastColOffsetForRow, 0, rowOffset)                    

                normals.push(0, 1, 0)
                normals.push(0, 1, 0)
            }
            
            for (let col = 0; col <= columns; col++) {
                const colOffset = squareLength * col
                
                vertices.push(colOffset, 0, 0)                    
                vertices.push(colOffset, 0, lastRowOffsetForCol)                    

                normals.push(0, 1, 0)
                normals.push(0, 1, 0)
            }
        } else {
            vertices.push(0, 0, 0)                    
            vertices.push(lastColOffsetForRow, 0, 0)   
            vertices.push(0, 0, lastRowOffsetForCol)   
            vertices.push(lastColOffsetForRow, 0, lastRowOffsetForCol)   

            indices.push(0, 1, 3)
            indices.push(0, 2, 3)

            normals.push(0, 1, 0)
            normals.push(0, 1, 0)
            normals.push(0, 1, 0)
            normals.push(0, 1, 0)

            textureCoords.push(0, 1)
            textureCoords.push(1, 1)
            textureCoords.push(0, 0)
            textureCoords.push(1, 0)
        }

        this.vertices = vertices
        this.indices = indices
        this.normals = normals
        this.textureCoords = textureCoords

        this.mat = ShaderUtils.init3dTranslationMat(-lastColOffsetForRow / 2, 0, -lastRowOffsetForCol / 2)
    }

    vertices
    indices
    normals
    mat
}

export default Plane