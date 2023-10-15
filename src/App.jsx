import './App.css';
import React from 'react';
import Matrix from './Matrix.jsx';
import * as Constants from './utils/Constants.jsx';
import { socket } from './contexts/Socket.jsx';

const Slider = ({ delay, handleChange, handlePointerUpCapture }) => {
  return (
    <form onPointerUpCapture={handlePointerUpCapture}>
      <input
        type='range'
        min={Constants.MIN_MS_PER_TICK}
        max={Constants.MAX_MS_PER_TICK}
        step='50'
        value={delay}
        onChange={e => handleChange(e.target.value)}
      />
    </form>
  );
};

function App() {
  const [delay, setDelay] = React.useState(Constants.DEFAULT_MS_PER_TICK);

  const handleDelayChanged = (newDelay) => {
    setDelay(newDelay);
  };

  React.useEffect(() => {
    socket.on('delayChanged', handleDelayChanged);
    return () => socket.off('delayChanged', handleDelayChanged);
  }, []);

  const handlePointerUpCapture = () => {
    socket.emit('requestDelayChange', { roomCode: 1234, newDelay: delay });
  };

  // TODO - add back when server side implements adjustable delay socket.io emits
  return (
    <>
      <h1 id='title'>Echolocation</h1>
      <Slider
        delay={delay}
        handleChange={(newDelay) => setDelay(newDelay)}
        handlePointerUpCapture={handlePointerUpCapture}
      />
      <p>Update delay: {delay} ms</p>
      <br />
      <br />
      <Matrix />
    </>
  )
}

export default App
