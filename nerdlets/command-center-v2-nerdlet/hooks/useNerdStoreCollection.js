import { useCallback, useMemo } from 'react';
import { AccountStorageMutation, AccountStorageQuery } from 'nr1';

export default function useNerdStoreCollection(collection) {
  const load = useCallback(
    async (accountIds) => {
      const results = await Promise.all(
        accountIds.map((accountId) =>
          AccountStorageQuery.query({
            accountId,
            collection,
            fetchPolicyType: AccountStorageQuery.FETCH_POLICY_TYPE.NETWORK_ONLY,
          }).then((res) =>
            // inject accountId so documents remain traceable after flattening
            (res?.data || []).map((doc) => ({ ...doc, accountId }))
          )
        )
      );
      return results.flat();
    },
    [collection]
  );

  const write = useCallback(
    (documentId, document, accountId) =>
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection,
        documentId,
        document,
      }),
    [collection]
  );

  const remove = useCallback(
    (documentId, accountId) =>
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection,
        documentId,
      }),
    [collection]
  );

  return useMemo(() => ({ load, write, remove }), [load, write, remove]);
}
