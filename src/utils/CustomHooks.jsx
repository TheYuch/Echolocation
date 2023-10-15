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