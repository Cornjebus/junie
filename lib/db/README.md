# Supabase Client Utilities

This directory contains Supabase client utilities for the Junie application with Clerk authentication integration.

## Files

- **`types.ts`** - TypeScript type definitions for all database tables
- **`supabase-server.ts`** - Server-side Supabase client with Clerk JWT integration
- **`supabase-client.ts`** - Client-side Supabase client for browser operations

## Setup

### Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Clerk JWT Template

1. Go to your Clerk Dashboard → JWT Templates
2. Create a new template named "supabase"
3. Add the following claims:

```json
{
  "sub": "{{user.id}}"
}
```

## Usage

### Server-Side Operations (App Router)

Use the server-side client for authenticated operations:

```typescript
import { createClient } from '@/lib/db/supabase-server';

export async function GET() {
  const supabase = await createClient();

  // Query with automatic RLS enforcement
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'active');

  return Response.json({ data: cases, error });
}
```

### Server Actions

```typescript
'use server'

import { createClient, getCurrentUser } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createCase(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('cases')
    .insert({
      user_id: user.id,
      kind: formData.get('kind') as 'business' | 'career',
      selected_option: JSON.parse(formData.get('option') as string),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/cases');
  return { data };
}
```

### Client-Side Operations

Use the client-side client for real-time subscriptions:

```typescript
'use client'

import { useEffect, useState } from 'react';
import { subscribeToTable } from '@/lib/db/supabase-client';
import type { Task } from '@/lib/db/types';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToTable('tasks', (payload) => {
      console.log('Task updated:', payload);
      // Update your local state here
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Helper Functions

The server-side client includes several helper functions:

```typescript
import {
  getCurrentUser,
  getCurrentUserProfile,
  getCurrentUserCases,
  getCurrentUserSubscription,
  syncUserToSupabase,
} from '@/lib/db/supabase-server';

// Get current authenticated user
const user = await getCurrentUser();

// Get user profile
const profile = await getCurrentUserProfile();

// Get active cases
const cases = await getCurrentUserCases();

// Get subscription
const subscription = await getCurrentUserSubscription();

// Sync Clerk user (call from webhooks)
await syncUserToSupabase({
  id: clerkUser.id,
  emailAddresses: clerkUser.emailAddresses,
  firstName: clerkUser.firstName,
  lastName: clerkUser.lastName,
});
```

## Row Level Security (RLS)

All tables have RLS enabled. The Clerk JWT is automatically included in requests to enforce RLS policies:

- Users can only access their own data
- Template tables are publicly readable
- Service accounts can insert AI costs

## TypeScript Types

All database tables have full TypeScript support:

```typescript
import type {
  User,
  Profile,
  Case,
  Task,
  Database
} from '@/lib/db/types';

// Typed queries
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'todo'); // ✅ TypeScript knows valid statuses

// data is typed as Task[]
```

## Real-Time Subscriptions

### Subscribe to Table Changes

```typescript
import { subscribeToTable } from '@/lib/db/supabase-client';

const unsubscribe = subscribeToTable('tasks', (payload) => {
  console.log('Change:', payload.eventType); // 'INSERT' | 'UPDATE' | 'DELETE'
  console.log('New data:', payload.new);
  console.log('Old data:', payload.old);
});

// Cleanup
unsubscribe();
```

### Subscribe to Row Changes

```typescript
import { subscribeToRow } from '@/lib/db/supabase-client';

const unsubscribe = subscribeToRow('cases', 'case-id-123', (payload) => {
  console.log('Case updated:', payload.new);
});

// Cleanup
unsubscribe();
```

### Presence Channel (Who's Online)

```typescript
import { createPresenceChannel } from '@/lib/db/supabase-client';

const { channel, track, untrack } = createPresenceChannel('case-123', {
  user_id: 'user-456',
  name: 'John Doe',
});

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  console.log('Users online:', Object.values(state));
});

// Start tracking
track();

// Stop tracking (on unmount)
untrack();
```

## Vector Search

Use the built-in PostgreSQL functions for semantic search:

```typescript
import { createClient } from '@/lib/db/supabase-server';

const supabase = await createClient();

// Search similar paths
const { data: paths } = await supabase.rpc('search_similar_paths', {
  query_embedding: [0.1, 0.2, ...], // Your embedding vector
  match_threshold: 0.7,
  match_count: 5,
});

// Search user embeddings for RAG
const user = await getCurrentUser();
const { data: embeddings } = await supabase.rpc('search_embeddings', {
  query_embedding: [0.1, 0.2, ...],
  user_uuid: user.id,
  match_threshold: 0.7,
  match_count: 10,
});
```

## Error Handling

Always check for errors in Supabase responses:

```typescript
const { data, error } = await supabase
  .from('cases')
  .select('*');

if (error) {
  console.error('Database error:', error);
  return { error: error.message };
}

return { data };
```

## Best Practices

1. **Always use server-side client for mutations** - This ensures RLS is enforced
2. **Use client-side client only for real-time** - Avoid direct queries from the browser
3. **Check authentication** - Use `getCurrentUser()` before operations
4. **Handle errors** - Always check the `error` property in responses
5. **Type everything** - Leverage the TypeScript types for type safety
6. **Revalidate paths** - Use `revalidatePath()` after mutations in Server Actions

## Example: Complete CRUD Operations

```typescript
'use server'

import { createClient, getCurrentUser } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';
import type { TaskStatus } from '@/lib/db/types';

// Create
export async function createTask(planId: string, title: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      plan_id: planId,
      week_number: 1,
      title,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return { data };
}

// Read
export async function getTasks(planId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('plan_id', planId)
    .order('week_number', { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

// Update
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return { data };
}

// Delete
export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return { success: true };
}
```

## Troubleshooting

### RLS Errors

If you get RLS policy violations:

1. Check that Clerk JWT template is configured correctly
2. Verify the user is authenticated
3. Ensure the JWT is being passed in the Authorization header

### Type Errors

If TypeScript types are incorrect:

1. Regenerate types from your schema
2. Ensure `Database` type matches your actual schema
3. Check that nullable fields are marked correctly

### Real-time Not Working

If real-time subscriptions aren't firing:

1. Check that RLS policies allow SELECT on the table
2. Verify Supabase Realtime is enabled for the table
3. Ensure your subscription filter is correct
