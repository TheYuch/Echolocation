import { useState } from 'react'
import './Create.css'

const N = 20;
function Create() {
  const [matrix, setMatrix] = useState(Array.from({length: N}, () => Array.from({length: N}), () => null));

  const handleMatrixChange = (row, column, value) => {
    let copy = [...matrix];
    copy[row][column] = value;
    setMatrix(copy);
  };

  return (
    <>
      <table>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((column, columnIndex) => (
                <td key={columnIndex}>
                  <input className='box'
                    onChange={e => handleMatrixChange(rowIndex, columnIndex, e)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Create
