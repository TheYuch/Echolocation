import * as Constants from '../utils/Constants.jsx';

function Box({ type, val, signals, isSelected }) {
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
  if (isSelected) {
    color = Constants.CELL_SELECT_COLOR;
  } else if (signals.length > 0) {
    if (type === 'note') {
      color = Constants.CELL_NOTE_COLORS[val.note];
    } else { // TODO: for each signal, mix the color together instead of just representing the first signal in the list of signals
      color = Constants.CELL_SIGNAL_COLORS[signals[0].type];
    }
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
