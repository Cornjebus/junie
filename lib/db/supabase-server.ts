/**
 * Server-side Supabase client with Clerk JWT integration
 *
 * This client automatically injects the Clerk user's JWT token into Supabase requests
 * for Row Level Security (RLS) enforcement.
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/db/supabase-server';
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('cases').select('*');
 *   return Response.json({ data, error });
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import type { Database } from './types';

/**
 * Creates a Supabase client for server-side operations (App Router)
 * Automatically includes Clerk JWT for RLS enforcement
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Get Clerk session token for RLS
  const { getToken } = await auth();
  const clerkToken = await getToken({ template: 'supabase' });

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: clerkToken
          ? {
              Authorization: `Bearer ${clerkToken}`,
            }
          : {},
      },
    }
  );
}

/**
 * Get the current authenticated user from Clerk
 * Returns null if no user is authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

/**
 * Get the current user's profile
 * Returns null if no profile exists
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}

/**
 * Get the current user's active cases
 */
export async function getCurrentUserCases() {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }

  return cases || [];
}

/**
 * Get the current user's subscription
 */
export async function getCurrentUserSubscription() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return subscription;
}

/**
 * Sync Clerk user to Supabase
 * Call this from Clerk webhooks or after sign-up
 */
export async function syncUserToSupabase(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
}) {
  const supabase = await createClient();

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ') || null;

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        full_name: fullName,
      },
      {
        onConflict: 'clerk_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }

  return data;
}
