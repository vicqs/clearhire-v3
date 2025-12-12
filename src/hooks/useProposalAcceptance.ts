/**
 * Hook para manejar aceptación de propuestas desde UI
 */

import { useState, useCallback } from 'react';
import { dataService } from '../services/dataService';
import type { AcceptanceData, AcceptanceResult } from '../types/tracking';

export interface UseProposalAcceptanceState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  result: AcceptanceResult | null;
}

export interface UseProposalAcceptanceActions {
  acceptProposal: (proposalId: string, candidateId: string, acceptanceData: AcceptanceData) => Promise<void>;
  reset: () => void;
}

export function useProposalAcceptance(): UseProposalAcceptanceState & UseProposalAcceptanceActions {
  const [state, setState] = useState<UseProposalAcceptanceState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    result: null
  });

  const acceptProposal = useCallback(async (
    proposalId: string,
    candidateId: string,
    acceptanceData: AcceptanceData
  ) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false
    }));

    try {
      const result = await dataService.acceptProposal(proposalId, candidateId, acceptanceData);
      
      setState({
        isLoading: false,
        isSuccess: result.success,
        error: result.success ? null : (result.errors?.[0] || 'Error desconocido'),
        result
      });

    } catch (error) {
      setState({
        isLoading: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        result: null
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      error: null,
      result: null
    });
  }, []);

  return {
    ...state,
    acceptProposal,
    reset
  };
}