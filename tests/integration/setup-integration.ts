import { beforeAll, beforeEach, afterEach } from 'vitest'

// Polyfills para Node.js 16.20.2
beforeAll(async () => {
  // Polyfill for crypto.getRandomValues in Node 16
  try {
    const { webcrypto } = await import('node:crypto')
    if (!globalThis.crypto) {
      globalThis.crypto = webcrypto as any
    }
  } catch (error) {
    console.warn('Could not load crypto polyfill:', error)
  }

  // Polyfill for fetch API in Node 16
  try {
    const undici = await import('undici')
    if (!globalThis.fetch) {
      globalThis.fetch = undici.fetch as any
      globalThis.Headers = undici.Headers as any
      globalThis.Request = undici.Request as any
      globalThis.Response = undici.Response as any
    }
  } catch (error) {
    console.warn('Could not load undici polyfills:', error)
  }

  // Configuración de entorno para testing
  process.env.NODE_ENV = 'test'
  
  console.log('🚀 Setup de integración completado para Node.js 16.20.2')
})

// Limpiar estado entre pruebas
beforeEach(() => {
  // Limpiar cualquier estado global si es necesario
})

afterEach(() => {
  // Limpiar después de cada prueba
})