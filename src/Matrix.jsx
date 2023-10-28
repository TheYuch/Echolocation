import React from 'react';
import './Matrix.css';
import { useKeyDown } from './utils/CustomHooks';
import Box from './components/Box.jsx';
import * as Tone from 'tone';
import { socket } from './contexts/Socket.jsx';

const MatrixTable = ({ matrix, selectedRow, selectedColumn, handleClickCell }) => {
  const tr = [];
  for (let r = 0; r < matrix.length; r++) {
    const td = [];
    for (let c = 0; c < matrix[0].length; c++) {
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

  const handleRequestCellChange = (row, column, c) => {
    socket.emit('requestCellChange', { roomCode: 1234, row, column, c });
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
    handleRequestCellChange(selectedRow, selectedColumn, c);
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