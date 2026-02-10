import { useEffect, useState } from 'react';

/**
 * Debounce Hook für optimierte Search/Filter Inputs
 * Verzögert Updates bis User aufhört zu tippen
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced Callback Hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useState<NodeJS.Timeout | null>(null)[0];

  useEffect(() => {
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [timeoutRef]);

  return ((...args: Parameters<T>) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    const timeout = setTimeout(() => {
      callback(...args);
    }, delay);

    // @ts-ignore
    timeoutRef = timeout;
  }) as T;
}
