import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    console.log('[API] Auth userId:', userId)

    if (!userId) {
      console.error('[API] No userId from auth()')
      return NextResponse.json({ error: 'Unauthorized - not logged in' }, { status: 401 })
    }

    const { sparks, values, dream } = await request.json()
    console.log('[API] Received data:', { sparks, values, dreamLength: dream?.length })

    // Validate input
    if (!sparks || !Array.isArray(sparks) || sparks.length === 0) {
      return NextResponse.json(
        { error: 'At least one spark is required' },
        { status: 400 }
      )
    }

    if (!values || !Array.isArray(values) || values.length < 1 || values.length > 3) {
      return NextResponse.json(
        { error: '1-3 values are required' },
        { status: 400 }
      )
    }

    if (!dream || typeof dream !== 'string' || dream.length < 20) {
      return NextResponse.json(
        { error: 'Dream must be at least 20 characters' },
        { status: 400 }
      )
    }

    // First, ensure user exists in users table
    console.log('[API] Checking for user in Supabase with clerk_id:', userId)
    const { data: user, error: userSelectError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    console.log('[API] User query result:', { user, error: userSelectError })

    if (!user) {
      console.log('[API] User not found, creating new user...')
      // Create user if they don't exist
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ clerk_id: userId, email: '' }) // Email will be updated by webhook
        .select('id')
        .single()

      if (userError) {
        console.error('[API] Error creating user:', userError)
        return NextResponse.json({ error: `Failed to create user: ${userError.message}` }, { status: 500 })
      }
      console.log('[API] Created new user:', newUser)
    }

    // Get user ID from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upsert profile (update if exists, insert if not)
    console.log('[API] Upserting profile for user_id:', dbUser.id)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: dbUser.id,
        sparks,
        values,
        dream,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'  // Specify which field to check for conflicts
      })
      .select()

    if (profileError) {
      console.error('[API] Error saving profile:', profileError)
      return NextResponse.json(
        { error: `Failed to save profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log('[API] Profile saved successfully:', profileData)
    return NextResponse.json({ success: true, profile: profileData })
  } catch (error) {
    console.error('Error in onboarding submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
