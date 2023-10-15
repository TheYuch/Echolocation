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
        type: '',
        val: {},
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
          onClick={() => handleClickCell(r, c)}
        >
          <Box
            type={matrix[r][c].type}
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
  if (ticks % val.ticksPerBeat === 0) {
    copy[r][c].signalDirection = 'e'; // TODO - use val.direction later
  }
};

const handleNoteAdjuster = (val, copy, r, c, ticks) => {
  if (ticks % val.ticksPerBeat === 0) {
    copy[r][c].signalDirection = 's';
  }
}

const setNextSignals = (todoSignals, copy, r, c) => {
  switch (copy[r][c].signalDirection) {
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
        
        switch (copy[r][c].type) {
          case 'metronome':
            handleMetronome(copy[r][c].val, copy, r, c, ticks);
            break;
          case 'noteAdjuster':
            handleNoteAdjuster(copy[r][c].val, copy, r, c, ticks)
            break;
        }
      }
    }

    // Propagating signals
    for (let i = 0; i < todoSignals.length; i++) {
      const [r, c, dir] = todoSignals[i];
      copy[r][c].signalDirection = dir;

      // Play sounds
      if (copy[r][c].type === 'note' && copy[r][c].signalDirection !== '') {
        const val = copy[r][c].val;
        const synth = new Tone.Synth().toDestination(); // TODO: use polysynth
        synth.triggerAttackRelease(val.note.toUpperCase() + val.octave, '4n'); // TODO: need variable note lengths
      }
    }

    setMatrix(copy);
  };

  const handleMatrixChange = (row, column, value) => {
    if (row < 0 || row >= Constants.MATRIX_LENGTH || column < 0 || column >= Constants.MATRIX_LENGTH)
      return;
    let copy = [...matrix];
    copy[row][column] = value;
    setMatrix(copy);
  };

  useKeyDown((c) => {
    let newCell = matrix[selectedRow][selectedColumn];
    c = c.toLowerCase();
    if (c === 'backspace') { // Special character: backspace
      newCell.type = '';
      newCell.val = {};
    } else if (c.length === 1) {
      if (!isNaN(c)) { // Single-char number
        if (newCell.type === 'note') {
          newCell.val.octave = parseInt(c);
        } else if (newCell.type === 'metronome') {
          newCell.val.ticksPerBeat = parseInt(c);
        }
      } else { // Single-char alphabet
        if (c.match(/[a-g]/i)) {
          newCell.type = 'note';
          newCell.val = {
            note: c,
            octave: 4,
            accidental: '',
          };
        } else if (c === 'm') {
          newCell.type = 'metronome';
          newCell.val = {
            ticksPerBeat: 4,
          };
        } else if (c === 'n') {
          newCell.type = 'noteAdjuster';
          newCell.val = {
            ticksPerBeat: 4,
          };
        }
      }
    }

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