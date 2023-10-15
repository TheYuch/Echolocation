import React from "react";

const isAlphabet = (c) => c.length == 1 && c.match(/[a-z]/i);
const isNumber = (c) => c.length == 1 && (/^\d$/.test(c));

export const useKeyDown = (callback) => {
    const onKeyDown = (event) => {
        if (isAlphabet(event.key)) {
            event.preventDefault();
            callback(event.key.toUpperCase());
        } else if (isNumber(event.key)) {
            event.preventDefault();
            callback(parseInt(event.key, 10));
        } else if (event.key.toLowerCase() == 'backspace') {
            event.preventDefault();
            callback(event.key.toLowerCase());
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