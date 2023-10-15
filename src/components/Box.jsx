/* TODO: import Note, Metronome, etc. */

import * as Constants from '../utils/Constants.jsx';

function Box({ val, hasSignal, isSelected }) {
  let color = 'transparent';
  
  if (hasSignal) {
    if (val.toLowerCase().charAt(0).match(/[a-g]/i)) {
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
        }}
      >
        {val}
      </div>
    </>
  )
}

export default Box;
