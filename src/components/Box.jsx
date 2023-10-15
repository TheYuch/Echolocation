/* TODO: import Note, Metronome, etc. */

import * as Constants from '../utils/Constants.jsx';

function Box({ type, val, hasSignal, isSelected }) {
  let bold = false;
  let text = ''; // used for type === ''
  if (type === 'metronome') {
    bold = true;
    text = 'M' + val.ticksPerBeat;
  } else if (type === 'noteAdjuster') {
    bold = true;
    text = 'N' + val.ticksPerBeat;
  } else if (type === 'note') {
    text = val.note.toUpperCase() + val.accidental + val.octave;
  }

  let color = 'transparent';
  if (hasSignal) {
    if (type === 'note') {
      color = Constants.CELL_ACTIVATE_COLOR;
    } else {
      color = Constants.CELL_SIGNAL_COLOR;
    }
  } else if (isSelected) {
    color = Constants.CELL_SELECT_COLOR;
  }

  return (
    <>
      <div
        style={{
          backgroundColor: color,
          width:"100%",
          height:"100%",
          fontWeight: bold ? 'bold' : '',
        }}
      >
        {text}
      </div>
    </>
  )
}

export default Box;
