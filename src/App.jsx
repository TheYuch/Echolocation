import './App.css';
import React from 'react';
import Matrix from './Matrix.jsx';
import { socket } from './contexts/Socket.jsx';

const Slider = ({ delay, minDelay, maxDelay, handleChange, handlePointerUpCapture }) => {
  return (
    <form onPointerUpCapture={handlePointerUpCapture}>
      <input
        type='range'
        min={minDelay}
        max={maxDelay}
        step='50'
        value={delay}
        onChange={e => handleChange(e.target.value)}
      />
    </form>
  );
};

function App() {
  const [delay, setDelay] = React.useState(-1);
  const [minDelay, setMinDelay] = React.useState(-1);
  const [maxDelay, setMaxDelay] = React.useState(-1);

  const handleDelayChanged = ({ newDelay, newMinDelay, newMaxDelay }) => {
    setDelay(newDelay);
    setMinDelay(newMinDelay);
    setMaxDelay(newMaxDelay);
  };

  React.useEffect(() => {
    socket.on('delayChanged', handleDelayChanged);
    return () => socket.off('delayChanged', handleDelayChanged);
  }, []);

  const handlePointerUpCapture = () => {
    socket.emit('requestDelayChange', { roomCode: 1234, newDelay: delay });
  };
  
  return (
    <>
      <h1 id='title'>Echolocation</h1>
      { delay !== -1 && minDelay !== -1 && maxDelay !== -1 && 
        <>
          <Slider
            delay={delay}
            minDelay={minDelay}
            maxDelay={maxDelay}
            handleChange={(newDelay) => setDelay(newDelay)}
            handlePointerUpCapture={handlePointerUpCapture}
          />
          <p>Update delay: {delay} ms</p>
        </>
      }
      <br />
      <br />
      <Matrix />
    </>
  )
}

export default App;