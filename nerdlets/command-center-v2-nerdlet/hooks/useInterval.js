import { useEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    // callback ref lets the interval stay alive while the callback changes
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // null delay suspends the interval without tearing it down
    if (delay == null) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
