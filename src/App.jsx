import './App.css';
import { useState } from 'react';
import Matrix from './Matrix.jsx';
import * as Constants from './utils/Constants.jsx';

const Slider = ({ delay, handleChange }) => {
  return (
      <input
        type='range'
        min={Constants.MIN_MS_PER_TICK}
        max={Constants.MAX_MS_PER_TICK}
        step='50'
        value={delay}
        onChange={e => handleChange(e.target.value)}
      />
  );
};

function App() {
  const [delay, setDelay] = useState(Constants.DEFAULT_MS_PER_TICK);

  return (
    <>
      <h1 id='title'>Echolocation</h1>
      {/* <p>Adjust update delay:</p> // TODO - add back when server side implements adjustable delay socket.io emits
      <Slider
        delay={delay}
        handleChange={(newDelay) => setDelay(newDelay)}
      />
      <br />
      <br /> */}
      <Matrix delay={delay} />
    </>
  )
}

export default App
