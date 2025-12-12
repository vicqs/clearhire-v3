/**
 * Hook para auto-guardado de datos
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
}

export interface UseAutoSaveReturn {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: Error | null;
  forceSave: () => Promise<void>;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 5000
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const savingRef = useRef(false);

  const performSave = useCallback(async (dataToSave: T) => {
    if (savingRef.current) {
      return; // Evitar múltiples guardados concurrentes
    }

    try {
      savingRef.current = true;
      setSaveStatus('saving');
      setError(null);

      await onSave(dataToSave);

      setSaveStatus('saved');
      setLastSaved(new Date());

      // Auto-ocultar estado "saved" después de 3 segundos
      if (hideStatusTimeoutRef.current) {
        clearTimeout(hideStatusTimeoutRef.current);
      }
      hideStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

    } catch (err) {
      const saveError = err instanceof Error ? err : new Error('Save failed');
      setError(saveError);
      setSaveStatus('error');
      throw saveError;
    } finally {
      savingRef.current = false;
    }
  }, [onSave]);

  const forceSave = useCallback(async () => {
    // Cancelar auto-save pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await performSave(data);
  }, [data, performSave]);

  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Verificar si los datos han cambiado
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

    if (hasChanged && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (!savingRef.current) {
          performSave(data);
        }
      }, delay);
    }

    previousDataRef.current = data;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, performSave]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideStatusTimeoutRef.current) {
        clearTimeout(hideStatusTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    forceSave
  };
}