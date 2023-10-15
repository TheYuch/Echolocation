import React from 'react';
import './Matrix.css';
import * as Constants from './utils/Constants.jsx';
import { useKeyDown } from './utils/CustomHooks';
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

const initializePolySynths = () => { // TODO: do from server instead of in client
  return {
    "amsynth": new Tone.PolySynth(Tone.AMSynth).toDestination(),
    "duosynth": new Tone.PolySynth(Tone.DuoSynth).toDestination(),
    "fmsynth": new Tone.PolySynth(Tone.FMSynth).toDestination(),
    "membranesynth": new Tone.PolySynth(Tone.MembraneSynth).toDestination(),
    "metalsynth": new Tone.PolySynth(Tone.MetalSynth).toDestination(),
    "monosynth": new Tone.PolySynth(Tone.MonoSynth).toDestination(),
    "noisesynth": new Tone.PolySynth(Tone.NoiseSynth).toDestination(),
    "plucksynth": new Tone.PolySynth(Tone.PluckSynth).toDestination(),
    "synth": new Tone.PolySynth(Tone.Synth).toDestination(),
  };
}

const polySynths = initializePolySynths();

function Matrix() {
  const [matrix, setMatrix] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(-1);
  const [selectedColumn, setSelectedColumn] = React.useState(-1);

  const handleMatrixChanged = (newMatrix) => {
    setMatrix(newMatrix);
  };

  const handlePlaySounds = (soundsToPlay) => {
    for (const instrument in soundsToPlay) {
      if (soundsToPlay[instrument]['notes'].length === 0) {
        continue;
      }

      /*
      TODO: some instruments broken
      - NoiseSynth (&) is broken
      - PluckSynth (*) is broken
      */

      polySynths[instrument].set({ detune: -1200 });
      polySynths[instrument].triggerAttackRelease(soundsToPlay[instrument]['notes'], soundsToPlay[instrument]['lengths']);
    }
  };

  const handleRequestCellChange = (row, column, value) => {
    if (row < 0 || row >= Constants.MATRIX_LENGTH || column < 0 || column >= Constants.MATRIX_LENGTH)
      return;
    socket.emit('requestCellChange', { roomCode: 1234, row, column, value });
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
    if (c === 'backspace') { // Backspace for deletion
      newCell.type = '';
      newCell.val = {};
    } else if (c === 'arrowleft') { // Arrows for redirectors
      newCell.type = 'redirector';
      newCell.val = { direction: 'w' };
    } else if (c === 'arrowright') {
      newCell.type = 'redirector';
      newCell.val = { direction: 'e' };
    } else if (c === 'arrowup') {
      newCell.type = 'redirector';
      newCell.val = { direction: 'n' };
    } else if (c === 'arrowdown') {
      newCell.type = 'redirector';
      newCell.val = { direction: 's' };
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
            instrument: Constants.CELL_NOTE_DEFAULT_INSTRUMENT,
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
          } else { // Instruments setting: !@#$%^&*(
            if (c === '!') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[0];
            else if (c === '@') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[1];
            else if (c === '#') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[2];
            else if (c === '$') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[3];
            else if (c === '%') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[4];
            else if (c === '^') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[5];
            else if (c === '&') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[6];
            else if (c === '*') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[7];
            else if (c === '(') newCell.val.instrument = Constants.CELL_NOTE_INSTRUMENTS[8];
          }
        }
      }
    }

    handleRequestCellChange(selectedRow, selectedColumn, newCell);
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