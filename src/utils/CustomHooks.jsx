import React from "react";

export const useKeyDown = (callback) => {
    const onKeyDown = (event) => {
        callback(event.key);
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