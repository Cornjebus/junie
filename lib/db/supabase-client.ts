/**
 * Client-side Supabase client for browser operations
 *
 * This client is used for real-time subscriptions and client-side queries.
 * Note: For authenticated queries, use the server-side client instead.
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/db/supabase-client';
 *
 * // Subscribe to real-time updates
 * const subscription = supabase
 *   .channel('tasks')
 *   .on('postgres_changes', {
 *     event: '*',
 *     schema: 'public',
 *     table: 'tasks'
 *   }, (payload) => {
 *     console.log('Change received!', payload);
 *   })
 *   .subscribe();
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Creates a Supabase client for browser-side operations
 * This is a singleton instance that can be imported throughout the app
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Helper to subscribe to real-time changes on a table
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToTable('tasks', (payload) => {
 *   console.log('Task updated:', payload);
 * });
 *
 * // Later, to unsubscribe:
 * unsubscribe();
 * ```
 */
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper to subscribe to a specific row's changes
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToRow('cases', 'case-id-123', (payload) => {
 *   console.log('Case updated:', payload);
 * });
 * ```
 */
export function subscribeToRow<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`${table}_${id}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `id=eq.${id}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper for real-time presence (users currently viewing)
 *
 * @example
 * ```typescript
 * const { channel, track, untrack } = createPresenceChannel('case-123', {
 *   user_id: 'user-456',
 *   name: 'John Doe'
 * });
 *
 * channel.on('presence', { event: 'sync' }, () => {
 *   const state = channel.presenceState();
 *   console.log('Users online:', state);
 * });
 *
 * // Track your presence
 * track();
 *
 * // Stop tracking when component unmounts
 * untrack();
 * ```
 */
export function createPresenceChannel(
  channelName: string,
  userInfo: Record<string, any>
) {
  const channel = supabase.channel(channelName);

  const track = () => {
    channel.track(userInfo);
  };

  const untrack = () => {
    channel.untrack();
  };

  channel.subscribe();

  return { channel, track, untrack };
}
