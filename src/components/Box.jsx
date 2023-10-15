/* TODO: import Note, Metronome, etc. */

function Box({ val, isSelected, selectColor }) {
  return (
    <>
      <div
        style={{
          backgroundColor: isSelected ? selectColor : 'transparent',
          width:"100%", height:"100%" }}
      >
        {val}
      </div>
    </>
  )
}

export default Box;
