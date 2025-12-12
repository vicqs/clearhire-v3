// Utility to handle optional test dependencies
// This helps when dependencies are not installed or available

export const loadOptionalDependency = async <T>(
  moduleName: string,
  fallback: T
): Promise<T> => {
  try {
    const module = await import(moduleName)
    return module.default || module
  } catch (error) {
    console.warn(`Optional dependency '${moduleName}' not available, using fallback`)
    return fallback
  }
}

export const createMockSupabaseClient = () => ({
  auth: {
    signInWithPassword: () => Promise.resolve({ 
      data: { user: { id: 'mock-user-id', email: 'test@example.com' } }, 
      error: null 
    }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    }),
    getUser: () => Promise.resolve({ 
      data: { user: null }, 
      error: null 
    }),
  },
  from: (_table: string) => ({
    select: (_columns?: string) => ({
      eq: (_column: string, _value: any) => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      limit: (_count: number) => Promise.resolve({ data: [], error: null }),
    }),
    insert: (_data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    update: (_data: any) => ({
      eq: (_column: string, _value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: (_column: string, _value: any) => Promise.resolve({ error: null }),
    }),
    upsert: (_data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }),
})

export const createMockFetch = () => {
  return (_url: string, _options?: any) => Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Map(),
  })
}

// Check if we're in a test environment
export const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || 
         process.env.VITEST === 'true' ||
         typeof global !== 'undefined' && global.process?.env?.NODE_ENV === 'test'
}

// Setup polyfills for Node.js 16 compatibility
export const setupNode16Polyfills = () => {
  // Crypto polyfill
  if (!globalThis.crypto) {
    try {
      const { webcrypto } = require('node:crypto')
      globalThis.crypto = webcrypto as any
    } catch (error) {
      console.warn('Could not load crypto polyfill:', error)
    }
  }

  // Fetch polyfill
  if (!globalThis.fetch) {
    try {
      const undici = require('undici')
      globalThis.fetch = undici.fetch
      globalThis.Headers = undici.Headers
      globalThis.Request = undici.Request
      globalThis.Response = undici.Response
    } catch (error) {
      console.warn('Could not load fetch polyfill, using mock:', error)
      globalThis.fetch = createMockFetch() as any
      globalThis.Headers = class MockHeaders extends Map {} as any
      globalThis.Request = class MockRequest {} as any
      globalThis.Response = class MockResponse {} as any
    }
  }
}

// Initialize polyfills if in test environment
if (isTestEnvironment()) {
  setupNode16Polyfills()
}