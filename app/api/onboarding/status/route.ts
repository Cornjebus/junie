import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a profile with sparks/values/dream
    const { data: profile } = await supabase
      .from('profiles')
      .select('sparks, values, dream')
      .eq('user_id', userId)
      .single()

    const hasCompletedOnboarding = Boolean(
      profile &&
      profile.sparks &&
      profile.sparks.length > 0 &&
      profile.values &&
      profile.values.length > 0 &&
      profile.dream
    )

    return NextResponse.json({ hasCompletedOnboarding })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json({ hasCompletedOnboarding: false })
  }
}
