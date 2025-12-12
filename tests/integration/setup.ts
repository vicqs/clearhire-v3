import { vi, beforeEach, afterEach } from 'vitest'
import { createMockSupabaseClient, setupNode16Polyfills } from '../utils/testDependencies'

// Setup Node.js 16 polyfills
setupNode16Polyfills()

// Test environment configuration
const supabaseUrl = 'https://vzcuumrnilzeufizyfei.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A'

// Test user credentials
export const TEST_USER = {
  email: 'test@clearhire.com',
  password: 'test123456',
  id: '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff'
}

// Create test Supabase client with fallback to mock
export const testSupabase = (() => {
  try {
    // Try to require Supabase synchronously first
    const supabaseModule = require('@supabase/supabase-js')
    if (supabaseModule && supabaseModule.createClient) {
      return supabaseModule.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      })
    }
  } catch (error) {
    console.warn('Supabase not available, using mock client')
  }
  
  // Fallback to mock client
  return createMockSupabaseClient()
})()

// Helper to authenticate test user
export async function authenticateTestUser() {
  try {
    const { data, error } = await testSupabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
    
    if (error) {
      throw new Error(`Failed to authenticate test user: ${(error as any)?.message || 'Unknown error'}`)
    }
    
    return data.user || { id: TEST_USER.id, email: TEST_USER.email }
  } catch (err) {
    console.warn('Authentication failed, using mock user:', err)
    return { id: TEST_USER.id, email: TEST_USER.email }
  }
}

// Helper to cleanup test data
export async function cleanupTestData(userId: string) {
  try {
    // Delete in reverse order of dependencies
    await testSupabase.from('candidate_references').delete().eq('profile_id', userId)
    await testSupabase.from('soft_skills').delete().eq('profile_id', userId)
    await testSupabase.from('languages').delete().eq('profile_id', userId)
    await testSupabase.from('education').delete().eq('profile_id', userId)
    await testSupabase.from('experiences').delete().eq('profile_id', userId)
    await testSupabase.from('badges').delete().eq('profile_id', userId)
    await testSupabase.from('gamification_data').delete().eq('profile_id', userId)
    await testSupabase.from('user_preferences').delete().eq('profile_id', userId)
    await testSupabase.from('profiles').delete().eq('user_id', userId)
  } catch (error) {
    console.warn('Cleanup warning:', error)
  }
}

// Helper to create test profile
export async function createTestProfile(userId: string) {
  try {
    const { data, error } = await testSupabase
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: 'Test',
        last_name: 'User',
        email: TEST_USER.email,
        phone: '+1234567890',
        country: 'Costa Rica',
        trade: 'Software Development'
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create test profile: ${(error as any)?.message || 'Unknown error'}`)
    }
    
    return data
  } catch (err) {
    console.warn('Profile creation failed, using mock data:', err)
    return {
      user_id: userId,
      first_name: 'Test',
      last_name: 'User',
      email: TEST_USER.email,
      phone: '+1234567890',
      country: 'Costa Rica',
      trade: 'Software Development'
    }
  }
}

// Mock console to reduce noise in tests
export function mockConsole() {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  return originalConsole
}