import { useCallback, useMemo } from 'react';
import { AccountStorageMutation, AccountStorageQuery } from 'nr1';

export default function useNerdStoreCollection(accountId, collection) {
  const load = useCallback(async () => {
    const res = await AccountStorageQuery.query({
      accountId,
      collection,
      fetchPolicyType: AccountStorageQuery.FETCH_POLICY_TYPE.CACHE_FIRST,
    });
    return res?.data || [];
  }, [accountId, collection]);

  const write = useCallback(
    (documentId, document) =>
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection,
        documentId,
        document,
      }),
    [accountId, collection]
  );

  const remove = useCallback(
    (documentId) =>
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection,
        documentId,
      }),
    [accountId, collection]
  );

  return useMemo(() => ({ load, write, remove }), [load, write, remove]);
}
