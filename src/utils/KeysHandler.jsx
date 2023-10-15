import { useEffect } from "react";

const isAlphabet = (c) => c.length == 1 && c.match(/[a-z]/i);

export const useKeyDown = (callback) => {
    const onKeyDown = (event) => {
        const wasValidKeyPressed = isAlphabet(event.key);
        if (wasValidKeyPressed) {
          event.preventDefault();
          callback(event.key.toUpperCase());
        }
    };
    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);
};