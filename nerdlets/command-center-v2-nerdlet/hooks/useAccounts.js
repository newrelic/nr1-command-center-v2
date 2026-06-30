import { useEffect, useState } from 'react';
import { AccountsQuery } from 'nr1';

export default function useAccounts(scopedAccountId) {
  const [state, setState] = useState({
    accounts: [],
    validating: true,
    validUser: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    AccountsQuery.query()
      .then((res) => {
        if (!active) return;
        if (res.error) {
          console.debug(res.error);
          setState({
            accounts: [],
            validating: false,
            validUser: false,
            error: res.error,
          });
          return;
        }
        const accounts = res.data || [];
        const validUser = accounts.some((a) => a.id === scopedAccountId);
        setState({ accounts, validating: false, validUser, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState({
          accounts: [],
          validating: false,
          validUser: false,
          error: err,
        });
      });
    return () => {
      active = false;
    };
  }, [scopedAccountId]);

  return state;
}
