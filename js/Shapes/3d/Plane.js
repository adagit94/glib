class Plane {
    contructor(squareLength, rows, columns, wireframe) {
        let vertices = [], indices = [], normals = []
        
        if (wireframe) {
            const lastColOffsetForRow = squareLength * columns

            for (let row = 0; row <= rows; row++) {
                const rowOffset = squareLength * row
                
                vertices.push(0, 0, rowOffset)                    
                vertices.push(lastColOffsetForRow, 0, rowOffset)                    
            }

            const lastRowOffsetForCol = squareLength * rows
            
            for (let col = 0; col <= columns; col++) {
                const colOffset = squareLength * col
                
                vertices.push(colOffset, 0, 0)                    
                vertices.push(colOffset, 0, lastRowOffsetForCol)                    
            }
        } else {
            
        }
    }

    vertices
    indices
    normals
}

export default Plane