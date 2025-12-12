import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfile } from '../../../src/hooks/useProfile';
import { dataService } from '../../../src/services/dataService';
import { authService } from '../../../src/services/authService';
import { mockProfile } from '../../../src/services/mock/mockData';

// Mock services
vi.mock('../../../src/services/dataService');
vi.mock('../../../src/services/authService');

const mockDataService = dataService as any;
const mockAuthService = authService as any;

// Setup default mocks
beforeEach(() => {
  mockAuthService.getCurrentUserId.mockReturnValue('test-user-id');
  mockDataService.getProfile.mockResolvedValue(mockProfile);
  mockDataService.saveProfile.mockResolvedValue(undefined);
  mockDataService.isSupabaseMode.mockReturnValue(true);
});

describe('Initial State', () => {
  it('should start with loading true and profile null', () => {
    const { result } = renderHook(() => useProfile())

    expect(result.current.loading).toBe(true)
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.saving).toBe(false)
  })
})

describe('Loading Profile', () => {
  it('should load profile successfully', async () => {
    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBeNull()
    expect(mockDataService.getProfile).toHaveBeenCalledWith('test-user-id')
  })

  it('should handle loading errors', async () => {
    const error = new Error('Failed to load profile')
    mockDataService.getProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toBeNull()
    expect(result.current.error).toEqual(error)
  })

  it('should use mock-user when not in Supabase mode', async () => {
    mockDataService.isSupabaseMode.mockReturnValue(false)

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockDataService.getProfile).toHaveBeenCalledWith('test-user-id')
  })
})

describe('Saving Profile', () => {
  it('should save profile successfully', async () => {
    const { result } = renderHook(() => useProfile())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updatedProfile = {
      ...mockProfile,
      personalInfo: {
        ...mockProfile.personalInfo,
        firstName: 'Updated Name'
      }
    }

    await act(async () => {
      await result.current.saveProfile(updatedProfile)
    })

    expect(result.current.saving).toBe(false)
    expect(result.current.profile).toEqual(updatedProfile)
    expect(mockDataService.saveProfile).toHaveBeenCalledWith('test-user-id', updatedProfile)
  })

  it('should handle save errors', async () => {
    const error = new Error('Failed to save profile')
    mockDataService.saveProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useProfile())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      try {
        await result.current.saveProfile(mockProfile)
      } catch (e) {
        // Expected to throw
      }
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.saving).toBe(false)
  })

  it('should set saving state during save operation', async () => {
    let resolveSave: (value: any) => void
    const savePromise = new Promise(resolve => {
      resolveSave = resolve
    })
    mockDataService.saveProfile.mockReturnValue(savePromise)

    const { result } = renderHook(() => useProfile())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start save operation
    act(() => {
      result.current.saveProfile(mockProfile)
    })

    expect(result.current.saving).toBe(true)

    // Complete save operation
    act(() => {
      resolveSave!(undefined)
    })

    await waitFor(() => {
      expect(result.current.saving).toBe(false)
    })
  })
})

describe('Update Field', () => {
  it('should update specific field and save', async () => {
    const { result } = renderHook(() => useProfile())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newTrade = 'Data Science'

    await act(async () => {
      await result.current.updateField('trade', newTrade)
    })

    expect(mockDataService.saveProfile).toHaveBeenCalledWith('test-user-id', {
      ...mockProfile,
      trade: newTrade
    })
  })

  it('should not update field when profile is null', async () => {
    mockDataService.getProfile.mockResolvedValue(null)

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateField('trade', 'New Trade')
    })

    expect(mockDataService.saveProfile).not.toHaveBeenCalled()
  })
})

describe('Reload', () => {
  it('should reload profile data', async () => {
    const { result } = renderHook(() => useProfile())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    mockDataService.getProfile.mockClear()

    await act(async () => {
      await result.current.reload()
    })

    expect(mockDataService.getProfile).toHaveBeenCalledTimes(1)
  })
})

describe('Error Handling', () => {
  it('should clear error on successful operations', async () => {
    // First, cause an error
    const error = new Error('Test error')
    mockDataService.getProfile.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.error).toEqual(error)
    })

    // Then, perform successful operation
    mockDataService.getProfile.mockResolvedValue(mockProfile)

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.error).toBeNull()
  })
})
