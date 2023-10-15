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
        signals: [], // each item in a signal is { type: '', direction: '' }
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
            signals={matrix[r][c].signals}
            isSelected={r == selectedRow && c == selectedColumn}
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
    copy[r][c].signals.push({
      type: 'metronome',
      direction: 'e', // TODO - use val.direction later
    });
  }
};

const handleNoteAdjuster = (val, copy, r, c, ticks) => {
  if (ticks % val.ticksPerBeat === 0) {
    copy[r][c].signals.push({
      type: 'noteAdjuster',
      direction: 's', // TODO - use val.direction later
    });
  }
}

const setNextSignals = (todoSignals, copy, r, c) => {
  for (let i = 0; i < copy[r][c].signals.length; i++) {
    const currSignal = copy[r][c].signals[i];
    switch (currSignal.direction) {
      case 'e':
        if (c + 1 < Constants.MATRIX_LENGTH) {
          todoSignals.push([r, c + 1, currSignal]);
        }
        break;
      case 'w':
        if (c - 1 >= 0) {
          todoSignals.push([r, c - 1, currSignal]);
        }
        break;
      case 'n':
        if (r - 1 >= 0) {
          todoSignals.push([r - 1, c, currSignal]);
        }
        break;
      case 's':
        if (r + 1 < Constants.MATRIX_LENGTH) {
          todoSignals.push([r + 1, c, currSignal]);
        }
        break;
    }
  }
  copy[r][c].signals = [];
}

function Matrix({ delay }) {
  const [ticks, setTicks] = useState(0);

  const [matrix, setMatrix] = useState(initializeMatrix());
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedColumn, setSelectedColumn] = useState(-1);

  const [synth, setSynth] = useState(new Tone.PolySynth().toDestination());

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
    let notesToPlay = [];
    let lengthsToPlay = [];
    for (let i = 0; i < todoSignals.length; i++) {
      const [r, c, signal] = todoSignals[i];
      copy[r][c].signals.push(signal);

      // Handle signal types
      if (copy[r][c].type === 'note') {
        if (signal.type === 'metronome') {
          const val = copy[r][c].val;
          notesToPlay.push(val.note.toUpperCase() + val.accidental + val.octave);
          lengthsToPlay.push(0.25); // TODO: need variable note lengths
        } else if (signal.type === 'noteAdjuster') {
          let noteWithAccidental = copy[r][c].val.note.toUpperCase() + copy[r][c].val.accidental;
          let index = -1;
          if (Constants.SCALE_SHARPS.includes(noteWithAccidental)) {
            index = Constants.SCALE_SHARPS.indexOf(noteWithAccidental);
            index = (index + 1) % Constants.SCALE_SHARPS.length;
            noteWithAccidental = Constants.SCALE_SHARPS[index];
          } else {
            index = Constants.SCALE_FLATS.indexOf(noteWithAccidental);
            index = (index + 1) % Constants.SCALE_FLATS.length;
            noteWithAccidental = Constants.SCALE_FLATS[index];
          }
          copy[r][c].val.note = noteWithAccidental.charAt(0).toLowerCase();
          copy[r][c].val.accidental = noteWithAccidental.charAt(1);
        }
      }
    }

    // Play notes
    if (notesToPlay.length > 0) {
      synth.set({ detune: -1200 });
      synth.triggerAttackRelease(notesToPlay, lengthsToPlay);
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
        } else if (newCell.type === 'metronome' || newCell.type === 'noteAdjuster') {
          newCell.val.ticksPerBeat = parseInt(c);
        }
      } else if (c.match(/[a-z]/i)) { // Single-char alphabet
        if (c.match(/[a-g]/i)) {
          newCell.type = 'note';
          newCell.val = {
            note: c,
            octave: Constants.CELL_NOTE_DEFAULT_OCTAVE,
            accidental: '',
          };
        } else if (c === 'm') {
          newCell.type = 'metronome';
          newCell.val = {
            ticksPerBeat: Constants.CELL_METRONOME_DEFAULT_TICKSPERBEAT,
          };
        } else if (c === 'n') {
          newCell.type = 'noteAdjuster';
          newCell.val = {
            ticksPerBeat: Constants.CELL_NOTEADJUSTER_DEFAULT_TICKSPERBEAT,
          };
        }
      } else { // Accidentals, etc.
        if (newCell.type === 'note') {
          if (c === '+' && Constants.NOTES_WITH_SHARPS.includes(newCell.val.note.toUpperCase())) {
            newCell.val.accidental = '#';
          } else if (c === '-' && Constants.NOTES_WITH_FLATS.includes(newCell.val.note.toUpperCase())) {
            newCell.val.accidental = 'b';
          }
        }
      }
    }

    handleMatrixChange(selectedRow, selectedColumn, newCell);
  });

  useInterval(() => { // Main clock function, BPM later set by user TODO
    handleMatrixUpdate();
    setTicks(ticks + 1);
  }, delay < 500 ? 100 : (delay < 1000 ? 500 : (delay < 1500 ? 1000 : (delay < 2000 ? 1500 : 2000)))); // TODO: don't know why this is the only way for variable intervals

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