import { useEffect, useState } from 'react';
import { AccountsQuery } from 'nr1';

export default function useAccounts() {
  const [state, setState] = useState({
    accounts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    AccountsQuery.query()
      .then((res) => {
        if (!active) return;
        setState({
          accounts: res.data || [],
          loading: false,
          error: res.error || null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setState({ accounts: [], loading: false, error: err });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
