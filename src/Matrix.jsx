import { useState, useEffect } from 'react';
import './Matrix.css';
import * as Constants from './utils/Constants.jsx';
import { useKeyDown, useInterval } from './utils/CustomHooks';
import Box from './components/Box.jsx';
import * as Tone from 'tone';

const initializeMatrix = () => {
  const matrix = [];
  for (let r = 0; r < Constants.MATRIX_LENGTH; r++) {
    matrix[r] = [];
    for (let c = 0; c < Constants.MATRIX_LENGTH; c++) {
      matrix[r][c] = {
        val: '',
        signalDirection: '',
      };
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
            val={matrix[r][c].val}
            isSelected={r == selectedRow && c == selectedColumn}
            hasSignal={matrix[r][c].signalDirection !== ''}
          />
        </td>
      );
    }
    tr.push(<tr key={r}>{td}</tr>);
  }
  
  return <table><tbody>{tr}</tbody></table>;
};

const handleMetronome = (val, copy, r, c, ticks) => {
  const secondChar = 4;//val.charAt(1); TODO
  if (isNaN(secondChar))
    return;
  const ticksPerBeat = +secondChar;
  if (ticks % ticksPerBeat === 0) {
    copy[r][c].signalDirection = 'e'; // TODO
  }
};

const setNextSignals = (todoSignals, copy, r, c) => {
  switch(copy[r][c].signalDirection) {
    case 'e':
      if (c + 1 < Constants.MATRIX_LENGTH) {
        todoSignals.push([r, c + 1, 'e']);
      }
      break;
    case 'w':
      if (c - 1 >= 0) {
        todoSignals.push([r, c - 1, 'w']);
      }
      break;
    case 'n':
      if (r - 1 >= 0) {
        todoSignals.push([r - 1, c, 'n']);
      }
      break;
    case 's':
      if (r + 1 < Constants.MATRIX_LENGTH) {
        todoSignals.push([r + 1, c, 's']);
      }
      break;
  }
  copy[r][c].signalDirection = '';
}

function Matrix() {
  const [ticks, setTicks] = useState(0);

  const [matrix, setMatrix] = useState(initializeMatrix());
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedColumn, setSelectedColumn] = useState(-1);

  const handleMatrixUpdate = () => {
    let copy = [...matrix];
    let todoSignals = [];

    // Update matrix
    for (let r = 0; r < Constants.MATRIX_LENGTH; r++) {
      for (let c = 0; c < Constants.MATRIX_LENGTH; c++) {
        setNextSignals(todoSignals, copy, r, c);

        const val = copy[r][c].val.toLowerCase();
        const type = val.charAt(0);
        switch (type) {
          case 'm':
            handleMetronome(val, copy, r, c, ticks);
            break;
        }
      }
    }

    // Propagating signals
    for (let i = 0; i < todoSignals.length; i++) {
      const [r, c, dir] = todoSignals[i];
      copy[r][c].signalDirection = dir;

      // Play sounds
      const val = copy[r][c].val.toLowerCase();
      const type = val.charAt(0);
      if (type.match(/[a-g]/i) && copy[r][c].signalDirection !== '') {
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(type.toUpperCase() + '4', '4n'); // TODO: temporary octave!!!!!!!!!!!!!!!! #anshulshah
      }
    }

    setMatrix(copy);
  };

  const handleMatrixChange = (row, column, value) => {
    if (row < 0 || row > Constants.MATRIX_LENGTH || column < 0 || column > Constants.MATRIX_LENGTH)
      return;
    let copy = [...matrix];
    copy[row][column] = value;
    setMatrix(copy);
  };

  useKeyDown((c) => {
    let newCell = matrix[selectedRow][selectedColumn];
    newCell.val = c;
    handleMatrixChange(selectedRow, selectedColumn, newCell);
  });

  useInterval(() => { // Main clock function, BPM later set by user TODO
    handleMatrixUpdate();
    setTicks(ticks + 1);
  }, Constants.MS_PER_TICK);
  
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