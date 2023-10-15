import { useState } from 'react';
import './Matrix.css';
import * as Constants from './utils/Constants.jsx';
import { useKeyDown } from './utils/KeysHandler';
import Box from './components/Box.jsx';
import * as Tone from 'tone';

const initializeMatrix = () => {
  const matrix = [];
  for (let r = 0; r < Constants.MATRIX_LENGTH; r++) {
    matrix[r] = [];
    for (let c = 0; c < Constants.MATRIX_LENGTH; c++) {
      matrix[r][c] = 'C4';
    }
  }

  return matrix;
};

const MatrixTable = ({ matrix, selectedRow, selectedColumn, handleClickCell }) => {
  const tr = [];
  for (let r = 0; r < Constants.MATRIX_LENGTH; r++) {
    const td = [];
    for (let c = 0; c < Constants.MATRIX_LENGTH; c++) {
      td.push(
        <td
          key={`${r},${c}`}
          onClick={() => handleClickCell(r,c)}
        >
          <Box
            val={matrix[r][c]}
            isSelected={r == selectedRow && c == selectedColumn}
            selectColor={Constants.CELL_SELECT_COLOR}
          />
        </td>
      );
    }
    tr.push(<tr key={r}>{td}</tr>);
  }
  
  return <table><tbody>{tr}</tbody></table>;
};

function Matrix() {
  const [matrix, setMatrix] = useState(initializeMatrix());
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const synth = new Tone.Synth().toDestination();

  const handleMatrixChange = (row, column, value) => {
    let copy = [...matrix];
    copy[row][column] = value;
    setMatrix(copy);
  };

  useKeyDown((c) => {
    handleMatrixChange(selectedRow, selectedColumn, c + '4');
  });

  return (
    <>
      <MatrixTable
        matrix={matrix}
        selectedRow={selectedRow}
        selectedColumn={selectedColumn}
        handleClickCell={(r, c) => {
          setSelectedRow(r);
          setSelectedColumn(c);
        }}
      />
    </>
  );
};

export default Matrix;