/**
 * Hook para consultar historial de seguimiento
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import type { TrackingEvent } from '../types/tracking';

export interface UseTrackingHistoryState {
  events: TrackingEvent[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface UseTrackingHistoryActions {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useTrackingHistory(
  applicationId: string,
  options: {
    autoLoad?: boolean;
    pageSize?: number;
  } = {}
): UseTrackingHistoryState & UseTrackingHistoryActions {
  const { autoLoad = true, pageSize = 20 } = options;
  
  const [state, setState] = useState<UseTrackingHistoryState>({
    events: [],
    isLoading: false,
    error: null,
    hasMore: true
  });

  const [offset, setOffset] = useState(0);

  const loadEvents = useCallback(async (reset = false) => {
    if (!applicationId) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const currentOffset = reset ? 0 : offset;
      const events = await dataService.getTrackingHistory(applicationId);
      
      // Simular paginación en el cliente
      const paginatedEvents = events.slice(currentOffset, currentOffset + pageSize);
      const hasMore = events.length > currentOffset + pageSize;

      setState(prev => ({
        ...prev,
        events: reset ? paginatedEvents : [...prev.events, ...paginatedEvents],
        isLoading: false,
        hasMore
      }));

      if (reset) {
        setOffset(pageSize);
      } else {
        setOffset(prev => prev + pageSize);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error cargando historial'
      }));
    }
  }, [applicationId, offset, pageSize]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await loadEvents(true);
  }, [loadEvents]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await loadEvents(false);
  }, [loadEvents, state.hasMore, state.isLoading]);

  useEffect(() => {
    if (autoLoad && applicationId) {
      refresh();
    }
  }, [applicationId, autoLoad, refresh]);

  return {
    ...state,
    refresh,
    loadMore
  };
}