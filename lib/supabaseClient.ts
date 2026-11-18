import { createBrowserClient } from '@supabase/ssr'
import { createClient as createStandardClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Legacy Singleton Client (Fixes components expecting `import { supabase } from '@/lib/supabaseClient'`)
 */
export const supabase = createStandardClient(
  supabaseUrl || 'https://missing-project.supabase.co',
  supabaseAnonKey || 'missing-public-anon-key'
)

/**
 * Browser Client: Use in Client Components ('use client')
 */
export function createClient() {
  if (!supabaseConfigured) {
    console.warn('Supabase is not configured. Check your environment variables.')
  }
  return createBrowserClient(
    supabaseUrl || 'https://missing-project.supabase.co',
    supabaseAnonKey || 'missing-public-anon-key'
  )
}
