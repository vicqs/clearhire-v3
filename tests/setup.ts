import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { setupNode16Polyfills } from './utils/testDependencies'

// Setup Node.js 16 polyfills
setupNode16Polyfills()

// Ensure DOM is available
if (typeof document === 'undefined') {
  console.warn('Document not available, jsdom may not be configured correctly')
}

// Mock environment variables
vi.mock('../src/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
  default: null
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((_callback, options) => ({
  root: options?.root || null,
  rootMargin: options?.rootMargin || '0px',
  thresholds: options?.threshold ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : [0],
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
})) as any

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((_callback) => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
})) as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const createStorageMock = () => {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    get length() {
      return Object.keys(store).length
    }
  }
}

global.localStorage = createStorageMock() as any
global.sessionStorage = createStorageMock() as any

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}