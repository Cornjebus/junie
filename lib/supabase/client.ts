/**
 * Supabase client utilities with Clerk authentication integration
 */

import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import type { Database } from './types'

/**
 * Create a Supabase client for server-side use with Clerk authentication
 */
export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        headers: async () => {
          const token = await (await auth()).getToken({ template: 'supabase' })
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      },
    }
  )
}

/**
 * Create a Supabase client for client-side use with Clerk authentication
 * Note: This should be used in client components with appropriate auth context
 */
export function createBrowserSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_KEY
  ) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  )
}
