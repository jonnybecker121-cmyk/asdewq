import { useState, useCallback } from 'react';

/**
 * Optimistic Update Hook
 * Aktualisiert UI sofort, synchronisiert dann mit DB
 */
export function useOptimisticUpdate<T>() {
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performOptimisticUpdate = useCallback(
    async <R>(
      optimisticFn: () => void,
      serverFn: () => Promise<R>,
      rollbackFn: () => void
    ): Promise<R | null> => {
      setIsOptimistic(true);
      setError(null);

      // 1. Sofortige UI-Aktualisierung
      optimisticFn();

      try {
        // 2. Server-Synchronisation
        const result = await serverFn();
        setIsOptimistic(false);
        return result;
      } catch (err) {
        // 3. Rollback bei Fehler
        console.error('❌ [OptimisticUpdate] Server-Sync fehlgeschlagen, Rollback...', err);
        rollbackFn();
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsOptimistic(false);
        return null;
      }
    },
    []
  );

  return {
    performOptimisticUpdate,
    isOptimistic,
    error,
  };
}
