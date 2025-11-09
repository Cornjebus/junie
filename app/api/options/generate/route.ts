import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Types
interface PathTemplate {
  id: string
  title: string
  category: string
  subcategory: string | null
  description: string | null
  why_template: string | null
  typical_fit: {
    sparks?: string[]
    values?: string[]
    skills_needed?: string[]
    time_commitment?: string
  } | null
  requirements: {
    min_hours?: number
    startup_cost?: [number, number]
    risk_level?: string
  } | null
  outcomes: {
    avg_time_to_first_client?: number
    avg_income?: number
    success_rate?: number
  } | null
  plan_template: {
    weeks?: Array<{
      week: number
      tasks: string[]
    }>
  } | null
  embedding: number[]
}

interface UserProfile {
  sparks: string[]
  values: string[]
  dream: string
}

interface ScoredPath {
  path: PathTemplate
  scores: {
    vector_similarity: number
    skills_match: number
    values_alignment: number
    feasibility: number
    total: number
  }
  why_you: string[]
}

/**
 * Create embedding for user profile
 */
async function createProfileEmbedding(profile: UserProfile): Promise<number[]> {
  const profileText = `
    Interests and passions: ${profile.sparks.join(', ')}
    Core values: ${profile.values.join(', ')}
    Aspiration: ${profile.dream}
  `.trim()

  console.log('[API] Creating embedding for profile:', profileText.substring(0, 100) + '...')

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: profileText,
  })

  return response.data[0].embedding
}

/**
 * Calculate skills match score (0-1)
 */
function calculateSkillsMatch(
  userSparks: string[],
  pathFit: PathTemplate['typical_fit']
): number {
  if (!pathFit?.sparks || pathFit.sparks.length === 0) {
    return 0.5 // neutral score if no data
  }

  const userSparksLower = userSparks.map(s => s.toLowerCase())
  const pathSparksLower = pathFit.sparks.map(s => s.toLowerCase())

  // Count overlapping sparks
  const matches = userSparksLower.filter(spark =>
    pathSparksLower.some(pathSpark =>
      spark.includes(pathSpark) || pathSpark.includes(spark)
    )
  ).length

  // Normalize to 0-1
  return Math.min(matches / Math.max(userSparksLower.length, 1), 1)
}

/**
 * Calculate values alignment score (0-1)
 */
function calculateValuesAlignment(
  userValues: string[],
  pathFit: PathTemplate['typical_fit']
): number {
  if (!pathFit?.values || pathFit.values.length === 0) {
    return 0.5 // neutral score if no data
  }

  const userValuesLower = userValues.map(v => v.toLowerCase())
  const pathValuesLower = pathFit.values.map(v => v.toLowerCase())

  // Count overlapping values
  const matches = userValuesLower.filter(value =>
    pathValuesLower.some(pathValue =>
      value.includes(pathValue) || pathValue.includes(value)
    )
  ).length

  // Normalize to 0-1
  return Math.min(matches / Math.max(userValuesLower.length, 1), 1)
}

/**
 * Calculate feasibility score (0-1)
 * Based on startup cost and time commitment
 */
function calculateFeasibility(path: PathTemplate): number {
  let score = 0.5 // start neutral

  // Lower startup cost = higher feasibility
  if (path.requirements?.startup_cost) {
    const avgCost = (path.requirements.startup_cost[0] + path.requirements.startup_cost[1]) / 2
    if (avgCost < 100) score += 0.3
    else if (avgCost < 500) score += 0.2
    else if (avgCost < 1000) score += 0.1
  }

  // Lower time commitment = higher feasibility
  if (path.requirements?.min_hours) {
    if (path.requirements.min_hours <= 10) score += 0.2
    else if (path.requirements.min_hours <= 20) score += 0.1
  }

  return Math.min(score, 1)
}

/**
 * Score a path against user profile
 */
function scorePath(path: PathTemplate, profile: UserProfile, vectorSimilarity: number): ScoredPath {
  const skillsMatch = calculateSkillsMatch(profile.sparks, path.typical_fit)
  const valuesAlignment = calculateValuesAlignment(profile.values, path.typical_fit)
  const feasibility = calculateFeasibility(path)

  // Weighted scoring
  const total =
    vectorSimilarity * 0.4 +
    skillsMatch * 0.2 +
    valuesAlignment * 0.2 +
    feasibility * 0.2

  return {
    path,
    scores: {
      vector_similarity: vectorSimilarity,
      skills_match: skillsMatch,
      values_alignment: valuesAlignment,
      feasibility,
      total,
    },
    why_you: [], // Will be filled by AI
  }
}

/**
 * Generate personalized "why you" text using Claude
 */
async function generateWhyYou(
  path: PathTemplate,
  profile: UserProfile,
  scores: ScoredPath['scores']
): Promise<string[]> {
  const prompt = `You are helping someone discover their perfect career or business path.

User Profile:
- Interests/Sparks: ${profile.sparks.join(', ')}
- Core Values: ${profile.values.join(', ')}
- Dream: ${profile.dream}

Recommended Path: ${path.title}
Description: ${path.description || 'N/A'}
Category: ${path.category} - ${path.subcategory || 'General'}

Match Scores:
- Skills Match: ${(scores.skills_match * 100).toFixed(0)}%
- Values Alignment: ${(scores.values_alignment * 100).toFixed(0)}%
- Overall Fit: ${(scores.total * 100).toFixed(0)}%

Generate exactly 3 short, personalized bullet points explaining why this path is a great fit for this specific person. Each bullet should:
1. Be specific to their sparks, values, or dream
2. Be encouraging and actionable
3. Be under 15 words
4. Start with an action word or benefit

Return ONLY a JSON array of 3 strings, nothing else. Example format:
["Aligns with your passion for helping others", "Low startup cost fits your budget constraints", "Flexible hours match your current availability"]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Extract JSON array from response
      const jsonMatch = content.text.match(/\[.*\]/s)
      if (jsonMatch) {
        const whyYou = JSON.parse(jsonMatch[0])
        return Array.isArray(whyYou) && whyYou.length === 3 ? whyYou : []
      }
    }
  } catch (error) {
    console.error('[API] Error generating why_you:', error)
  }

  // Fallback to template-based why_you
  return [
    `Matches your interest in ${profile.sparks[0] || 'new opportunities'}`,
    `Aligns with your value of ${profile.values[0] || 'personal growth'}`,
    `Supports your dream: "${profile.dream.substring(0, 40)}..."`,
  ]
}

/**
 * Generate mock data when no path templates exist
 */
function generateMockPaths(profile: UserProfile): any[] {
  const mockPaths = [
    {
      id: 'mock-1',
      title: 'Online Coaching Business',
      why_you: [
        `Uses your passion for ${profile.sparks[0] || 'helping others'}`,
        'Low cost to start with proven methods',
        'Flexible schedule fits your lifestyle',
      ],
      first_win: '3 paying clients in 6 weeks ($450-900/mo)',
      difficulty: 'Easy' as const,
      time_to_first_income_weeks: 6,
      startup_cost_range_usd: [100, 500] as [number, number],
      key_steps: [
        'Define your coaching niche and offer',
        'Create a simple landing page',
        'Reach out to your existing network',
        'Deliver first sessions and gather testimonials',
      ],
      risks: ['Client acquisition may take longer than expected', 'Need to build credibility'],
      fit_score: 5,
    },
    {
      id: 'mock-2',
      title: 'Freelance Consulting',
      why_you: [
        'Leverages your existing skills and experience',
        `Aligns with your value of ${profile.values[0] || 'independence'}`,
        'Can start immediately with current network',
      ],
      first_win: 'First paid project within 4 weeks ($500-2000)',
      difficulty: 'Medium' as const,
      time_to_first_income_weeks: 4,
      startup_cost_range_usd: [0, 200] as [number, number],
      key_steps: [
        'Identify your consulting specialization',
        'Create a portfolio of past work',
        'Set up LinkedIn and professional profiles',
        'Reach out to potential clients',
      ],
      risks: ['Income can be irregular', 'Requires strong self-discipline'],
      fit_score: 4,
    },
    {
      id: 'mock-3',
      title: 'Content Creation & Monetization',
      why_you: [
        `Perfect for your passion for ${profile.sparks[1] || 'sharing knowledge'}`,
        'Multiple revenue streams available',
        'Build an asset that grows over time',
      ],
      first_win: 'First sponsorship or affiliate sale in 8 weeks ($100-500)',
      difficulty: 'Medium' as const,
      time_to_first_income_weeks: 8,
      startup_cost_range_usd: [50, 300] as [number, number],
      key_steps: [
        'Choose your content platform and niche',
        'Create consistent content for 30 days',
        'Build an engaged audience',
        'Monetize through ads, sponsors, or products',
      ],
      risks: ['Takes time to build audience', 'Algorithm changes can impact reach'],
      fit_score: 4,
    },
    {
      id: 'mock-4',
      title: 'Digital Product Sales',
      why_you: [
        'Creates passive income streams',
        `Supports your dream: "${profile.dream.substring(0, 30)}..."`,
        'Scalable without trading time for money',
      ],
      first_win: 'First 10 sales within 10 weeks ($200-1000)',
      difficulty: 'Hard' as const,
      time_to_first_income_weeks: 10,
      startup_cost_range_usd: [200, 1000] as [number, number],
      key_steps: [
        'Validate your product idea with target audience',
        'Create your digital product (course, ebook, template)',
        'Build a simple sales funnel',
        'Launch to your network and beyond',
      ],
      risks: ['Upfront time investment before revenue', 'Market validation required'],
      fit_score: 3,
    },
    {
      id: 'mock-5',
      title: 'Local Service Business',
      why_you: [
        `Matches your value of ${profile.values[1] || 'community impact'}`,
        'Direct client relationships',
        'Proven business model',
      ],
      first_win: 'First 5 regular clients in 8 weeks ($1000-3000/mo)',
      difficulty: 'Medium' as const,
      time_to_first_income_weeks: 8,
      startup_cost_range_usd: [300, 2000] as [number, number],
      key_steps: [
        'Choose your service and define offerings',
        'Get necessary licenses and insurance',
        'Market to local community',
        'Deliver excellent service and ask for referrals',
      ],
      risks: ['Geographic limitations', 'Weather or local economy dependent'],
      fit_score: 3,
    },
  ]

  return mockPaths
}

/**
 * Main POST handler
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  // TEMPORARY: Return mock data immediately for testing
  // TODO: Remove this once OpenAI/Anthropic API integration is fixed
  console.log('[API] Returning mock data for testing')
  const mockPaths = generateMockPaths({
    sparks: ['Example'],
    values: ['Freedom'],
    dream: 'Test dream',
  })
  return NextResponse.json({
    options: mockPaths,
    meta: {
      total_count: mockPaths.length,
      source: 'mock',
      processing_time_ms: Date.now() - startTime,
    },
  })

  try {
    // 1. Authenticate user
    const { userId } = await auth()
    console.log('[API] /api/options/generate - userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - not logged in' }, { status: 401 })
    }

    // 2. Get user's database ID
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !dbUser) {
      console.error('[API] User not found:', userError)
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    console.log('[API] Database user ID:', dbUser.id)

    // 3. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('sparks, values, dream')
      .eq('user_id', dbUser.id)
      .single()

    if (profileError || !profile) {
      console.error('[API] Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profile not found. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    console.log('[API] Profile loaded:', {
      sparks: profile.sparks?.length || 0,
      values: profile.values?.length || 0,
      dreamLength: profile.dream?.length || 0,
    })

    // Validate profile data
    if (!profile.sparks || !profile.values || !profile.dream) {
      return NextResponse.json(
        { error: 'Incomplete profile. Please complete onboarding.' },
        { status: 400 }
      )
    }

    // 4. Create embedding for user profile
    let profileEmbedding: number[]
    try {
      profileEmbedding = await createProfileEmbedding({
        sparks: profile.sparks,
        values: profile.values,
        dream: profile.dream,
      })
      console.log('[API] Profile embedding created, dimensions:', profileEmbedding.length)
    } catch (error) {
      console.error('[API] Error creating embedding:', error)
      return NextResponse.json(
        { error: 'Failed to create profile embedding' },
        { status: 500 }
      )
    }

    // 5. Check if path_templates table has data
    const { count, error: countError } = await supabase
      .from('path_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    console.log('[API] Path templates count:', count, 'error:', countError)

    // 6. If no templates, return mock data
    if (count === 0 || count === null) {
      console.log('[API] No path templates found, returning mock data')
      const mockPaths = generateMockPaths({
        sparks: profile.sparks,
        values: profile.values,
        dream: profile.dream,
      })

      const elapsed = Date.now() - startTime
      console.log(`[API] Request completed in ${elapsed}ms (mock data)`)

      return NextResponse.json({
        options: mockPaths,
        meta: {
          total_count: mockPaths.length,
          source: 'mock',
          processing_time_ms: elapsed,
        },
      })
    }

    // 7. Search for similar paths using vector similarity
    const { data: similarPaths, error: searchError } = await supabase.rpc(
      'search_similar_paths',
      {
        query_embedding: profileEmbedding,
        match_threshold: 0.5, // Lower threshold to get more results
        match_count: 20, // Get more than needed for better scoring
      }
    )

    if (searchError) {
      console.error('[API] Error searching paths:', searchError)
      return NextResponse.json(
        { error: 'Failed to search path templates' },
        { status: 500 }
      )
    }

    console.log('[API] Found', similarPaths?.length || 0, 'similar paths')

    if (!similarPaths || similarPaths.length === 0) {
      // Fall back to mock data if no matches
      console.log('[API] No similar paths found, returning mock data')
      const mockPaths = generateMockPaths({
        sparks: profile.sparks,
        values: profile.values,
        dream: profile.dream,
      })

      const elapsed = Date.now() - startTime
      return NextResponse.json({
        options: mockPaths,
        meta: {
          total_count: mockPaths.length,
          source: 'mock',
          processing_time_ms: elapsed,
        },
      })
    }

    // 8. Get full path template data for matched paths
    const pathIds = similarPaths.map(p => p.id)
    const { data: fullPaths, error: pathsError } = await supabase
      .from('path_templates')
      .select('*')
      .in('id', pathIds)

    if (pathsError || !fullPaths) {
      console.error('[API] Error fetching full paths:', pathsError)
      return NextResponse.json({ error: 'Failed to fetch path details' }, { status: 500 })
    }

    // 9. Score all paths
    const scoredPaths: ScoredPath[] = fullPaths.map(path => {
      const similarityData = similarPaths.find(sp => sp.id === path.id)
      const vectorSimilarity = similarityData?.similarity || 0

      return scorePath(
        path as PathTemplate,
        {
          sparks: profile.sparks,
          values: profile.values,
          dream: profile.dream,
        },
        vectorSimilarity
      )
    })

    // 10. Sort by total score and take top 5
    scoredPaths.sort((a, b) => b.scores.total - a.scores.total)
    const topPaths = scoredPaths.slice(0, 5)

    console.log('[API] Top 5 path scores:', topPaths.map(p => ({
      title: p.path.title,
      score: p.scores.total.toFixed(2),
    })))

    // 11. Generate personalized "why you" text for each path
    const finalPaths = await Promise.all(
      topPaths.map(async scoredPath => {
        const whyYou = await generateWhyYou(
          scoredPath.path,
          {
            sparks: profile.sparks,
            values: profile.values,
            dream: profile.dream,
          },
          scoredPath.scores
        )

        // Extract plan template data
        const planTemplate = scoredPath.path.plan_template as any
        const firstWeek = planTemplate?.weeks?.[0]

        // Map to OptionCard format
        return {
          id: scoredPath.path.id,
          title: scoredPath.path.title,
          why_you: whyYou,
          first_win: scoredPath.path.outcomes?.avg_time_to_first_client
            ? `First client in ${scoredPath.path.outcomes.avg_time_to_first_client} weeks`
            : 'Quick wins within 6-8 weeks',
          difficulty: (scoredPath.path.requirements?.risk_level || 'Medium') as
            | 'Easy'
            | 'Medium'
            | 'Hard',
          time_to_first_income_weeks: scoredPath.path.outcomes?.avg_time_to_first_client || 8,
          startup_cost_range_usd: (scoredPath.path.requirements?.startup_cost || [
            0, 500,
          ]) as [number, number],
          key_steps: firstWeek?.tasks || [
            'Define your offer',
            'Set up basic infrastructure',
            'Start outreach',
          ],
          risks: [
            'Initial learning curve',
            'Market validation required',
          ],
          fit_score: Math.round(scoredPath.scores.total * 5), // Convert 0-1 to 1-5 stars
        }
      })
    )

    const elapsed = Date.now() - startTime
    console.log(`[API] Request completed in ${elapsed}ms`)

    return NextResponse.json({
      options: finalPaths,
      meta: {
        total_count: finalPaths.length,
        source: 'database',
        processing_time_ms: elapsed,
        vector_search_results: similarPaths.length,
      },
    })
  } catch (error) {
    console.error('[API] Unexpected error in /api/options/generate:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
