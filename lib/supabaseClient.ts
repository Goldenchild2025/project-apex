import { createBrowserClient } from '@supabase/ssr'
import { createClient as createStandardClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let browserClient: SupabaseClient | undefined

/**
 * Browser Client Singleton: Use in Client Components ('use client')
 */
export function createClient(): SupabaseClient {
  if (!supabaseConfigured) {
    console.warn('Supabase is not configured. Check your environment variables.')
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl || 'https://missing-project.supabase.co',
      supabaseAnonKey || 'missing-public-anon-key'
    )
  }

  return browserClient
}

/**
 * Shared client export for existing imports expecting `supabase`
 */
export const supabase: SupabaseClient =
  typeof window !== 'undefined'
    ? createClient()
    : createStandardClient(
        supabaseUrl || 'https://missing-project.supabase.co',
        supabaseAnonKey || 'missing-public-anon-key'
      )
