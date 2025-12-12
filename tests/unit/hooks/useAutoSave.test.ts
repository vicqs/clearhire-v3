import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from '../../../src/hooks/useAutoSave';

describe('useAutoSave', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with idle status', () => {
      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'data' },
          onSave: mockOnSave,
        })
      );

      expect(result.current.saveStatus).toBe('idle');
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('auto-save functionality', () => {
    it('should trigger save after delay when data changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 1000,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      // Cambiar los datos
      rerender({ data: { test: 'updated' } });

      // Avanzar el tiempo
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ test: 'updated' });
      });

      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });

    it('should not trigger save if data has not changed', () => {
      const { rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 1000,
          }),
        {
          initialProps: { data: { test: 'same' } },
        }
      );

      // "Cambiar" a los mismos datos
      rerender({ data: { test: 'same' } });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should debounce multiple rapid changes', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 1000,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      // Múltiples cambios rápidos
      rerender({ data: { test: 'change1' } });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      rerender({ data: { test: 'change2' } });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      rerender({ data: { test: 'final' } });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSave).toHaveBeenCalledWith({ test: 'final' });
    });
  });

  describe('save status management', () => {
    it('should show saving status during save operation', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      mockOnSave.mockReturnValue(savePromise);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 100,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      // Cambiar datos
      rerender({ data: { test: 'updated' } });

      // Avanzar tiempo para trigger save
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Verificar estado de saving
      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saving');
      });

      // Resolver el save
      await act(async () => {
        resolveSave!();
        await savePromise;
      });

      expect(result.current.saveStatus).toBe('saved');
    });

    it('should show error status when save fails', async () => {
      const error = new Error('Save failed');
      mockOnSave.mockRejectedValue(error);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 100,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      rerender({ data: { test: 'updated' } });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('error');
      });

      expect(result.current.error).toEqual(error);
    });

    it('should auto-hide saved status after 3 seconds', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 100,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      rerender({ data: { test: 'updated' } });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saved');
      });

      // Avanzar 3 segundos más
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('idle');
      });
    });
  });

  describe('forceSave', () => {
    it('should immediately trigger save when forceSave is called', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useAutoSave({
          data: { test: 'data' },
          onSave: mockOnSave,
          delay: 1000,
        })
      );

      await act(async () => {
        await result.current.forceSave();
      });

      expect(mockOnSave).toHaveBeenCalledWith({ test: 'data' });
      expect(result.current.saveStatus).toBe('saved');
    });

    it('should cancel pending auto-save when forceSave is called', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 1000,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      // Cambiar datos para trigger auto-save
      rerender({ data: { test: 'updated' } });

      // Llamar forceSave antes de que se complete el delay
      await act(async () => {
        await result.current.forceSave();
      });

      // Avanzar el tiempo original del auto-save
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Debería haberse llamado solo una vez (por forceSave)
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('concurrent saves prevention', () => {
    it('should not trigger multiple saves concurrently', async () => {
      let resolveFirstSave: () => void;
      const firstSavePromise = new Promise<void>((resolve) => {
        resolveFirstSave = resolve;
      });

      mockOnSave
        .mockReturnValueOnce(firstSavePromise)
        .mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ data }) =>
          useAutoSave({
            data,
            onSave: mockOnSave,
            delay: 100,
          }),
        {
          initialProps: { data: { test: 'initial' } },
        }
      );

      // Primer cambio
      rerender({ data: { test: 'change1' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Segundo cambio mientras el primero está en progreso
      rerender({ data: { test: 'change2' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Resolver el primer save
      await act(async () => {
        resolveFirstSave!();
        await firstSavePromise;
      });

      // Solo debería haberse llamado una vez
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });
});