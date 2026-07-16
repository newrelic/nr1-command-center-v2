import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NerdGraphQuery, UserQuery } from 'nr1';

const query = require('../utils');

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map()); // Map persists across renders without triggering re-renders

  useEffect(() => {
    let active = true;
    UserQuery.query()
      .then((res) => {
        if (!active) return;
        setUser(res || null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      });
    return () => {
      active = false;
    };
  }, []);

  const fetchUserName = useCallback(async (userId) => {
    if (userId == null) return null;
    const key = String(userId);
    const cache = cacheRef.current;
    if (cache.has(key)) return cache.get(key);

    try {
      const res = await NerdGraphQuery.query({ query: query.userName(userId) });
      const u = res?.data?.actor?.users?.userSearch?.users?.[0];
      const name = u?.name || null;
      cache.set(key, name);
      return name;
    } catch (err) {
      console.debug(`useCurrentUser.fetchUserName(${userId}) failed`, err);
      return null;
    }
  }, []);

  return useMemo(
    () => ({ user, error, fetchUserName }),
    [user, error, fetchUserName]
  );
}
