import React from "react";

const isAlphabet = (c) => c.length == 1 && c.match(/[a-z]/i);

export const useKeyDown = (callback) => {
    const onKeyDown = (event) => {
        const wasValidKeyPressed = isAlphabet(event.key);
        if (wasValidKeyPressed) {
            event.preventDefault();
            callback(event.key.toUpperCase());
        } else if (event.key.toLowerCase() == 'backspace') {
            event.preventDefault();
            callback('');
        }
    };
    React.useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);
};

export const useInterval = (callback, delay) => {
    const intervalRef = React.useRef(null);
    const savedCallback = React.useRef(callback);
    React.useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
    React.useEffect(() => {
      const tick = () => savedCallback.current();
      if (typeof delay === 'number') {
        intervalRef.current = window.setInterval(tick, delay);
        return () => window.clearInterval(intervalRef.current);
      }
    }, [delay]);
    return intervalRef;
};