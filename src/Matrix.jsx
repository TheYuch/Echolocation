import React from 'react';
import './Matrix.css';
import * as Constants from './utils/Constants.jsx';
import { useKeyDown, useInterval } from './utils/CustomHooks';
import Box from './components/Box.jsx';
import * as Tone from 'tone';
import { socket } from './contexts/Socket.jsx';

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

function Matrix({ delay }) {
  const [matrix, setMatrix] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(-1);
  const [selectedColumn, setSelectedColumn] = React.useState(-1);

  const [synth, setSynth] = React.useState(new Tone.PolySynth().toDestination());

  const handleMatrixChanged = (newMatrix) => {
    setMatrix(newMatrix);
  };

  const handlePlaySounds = ({ notesToPlay, lengthsToPlay }) => {
    if (notesToPlay.length > 0) {
      synth.set({ detune: -1200 });
      synth.triggerAttackRelease(notesToPlay, lengthsToPlay);
    }
  };

  const handleRequestMatrixChange = (row, column, value) => {
    if (row < 0 || row >= Constants.MATRIX_LENGTH || column < 0 || column >= Constants.MATRIX_LENGTH)
      return;
    socket.emit('requestMatrixChange', { roomCode: 1234, row, column, value });
    // Matrix state is updated locally successfully iff the server receives and emits back an updated matrix 
  };

  React.useEffect(() => {
    socket.emit('joinRoom', { roomCode: 1234 }); // TODO: tmp, joining room 1234 right away

    socket.on('matrixChanged', handleMatrixChanged);
    socket.on('playSounds', handlePlaySounds);

    return () => {
      socket.off('matrixChanged', handleMatrixChanged);
      socket.off('playSounds', handlePlaySounds);
    };
  }, []);

  useKeyDown((c) => {
    if (!matrix ||
        selectedRow < 0 || selectedRow >= Constants.MATRIX_LENGTH ||
        selectedColumn < 0 || selectedColumn >= Constants.MATRIX_LENGTH) {
      return;
    }

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

    handleRequestMatrixChange(selectedRow, selectedColumn, newCell);
  });

  return (
    <>
      { matrix && 
        <MatrixTable
          matrix={matrix}
          selectedRow={selectedRow}
          selectedColumn={selectedColumn}
          handleClickCell={(r, c) => {
            setSelectedRow(r);
            setSelectedColumn(c);
          }}
        />
      }
    </>
  );
};

export default Matrix;