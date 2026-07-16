import { useCallback, useEffect, useRef, useState } from 'react';
import { NerdGraphQuery } from 'nr1';

export default function useNerdGraphQuery(
  buildArgs,
  deps,
  { skip = false } = {}
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const isMountedRef = useRef(true); // guards against setState after unmount
  const buildArgsRef = useRef(buildArgs); // ref avoids re-creating the effect when buildArgs identity changes

  useEffect(() => {
    buildArgsRef.current = buildArgs;
  }, [buildArgs]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    return NerdGraphQuery.query(buildArgsRef.current())
      .then((res) => {
        if (!isMountedRef.current) return;
        if (res.error) {
          setError(res.error);
          setData(null);
        } else {
          setData(res.data);
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(err);
        setData(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    run();
  }, [skip, ...deps]);

  return { data, error, loading, refetch: run };
}
