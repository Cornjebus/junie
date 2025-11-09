'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, TrendingUp, Zap, AlertTriangle } from 'lucide-react'

interface PathOption {
  title: string
  category?: string
  why_you: string[]
  time_to_income?: string
  time_to_first_income_weeks?: number
  startup_cost?: string
  startup_cost_range_usd?: [number, number]
  risk_level?: 'low' | 'medium' | 'high'
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  first_win: string
}

export default function OptionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [paths, setPaths] = useState<PathOption[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('[Options] Fetching paths from API...')

      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(`${window.location.origin}/api/options/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch paths')
      }

      const data = await response.json()
      console.log('[Options] Received data:', data)
      setPaths(data.options || data.paths || [])
    } catch (err) {
      console.error('Error fetching paths:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out after 30 seconds. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load paths')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    if (!risk) return 'bg-gray-100 text-gray-800 border-gray-200'
    switch (risk.toLowerCase()) {
      case 'low':
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeToIncome = (path: PathOption) => {
    if (path.time_to_income) return path.time_to_income
    if (path.time_to_first_income_weeks) {
      const weeks = path.time_to_first_income_weeks
      if (weeks <= 4) return `${weeks} weeks`
      return `${Math.floor(weeks / 4)} months`
    }
    return 'Varies'
  }

  const formatStartupCost = (path: PathOption) => {
    if (path.startup_cost) return path.startup_cost
    if (path.startup_cost_range_usd) {
      const [min, max] = path.startup_cost_range_usd
      return `$${min}-${max}`
    }
    return 'Minimal'
  }

  const handleSelectPath = (path: PathOption) => {
    alert(`You selected: ${path.title}\n\nNext step: We'll build out your personalized action plan!`)
  }

  const handleRefineFurther = () => {
    alert('Coming soon: Refine your paths with additional preferences!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-6 w-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Crafting Your Paths...</p>
            <p className="text-sm text-gray-600">Analyzing your sparks, values, and dreams</p>
            <div className="mt-6 flex justify-center gap-1">
              <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchPaths} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-12">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Paths
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Based on your sparks, values, and dream - here are 5 paths tailored just for you
          </p>
        </div>

        {/* Path Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {paths.map((path, index) => (
            <Card
              key={index}
              className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 overflow-hidden group"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {path.title}
                  </CardTitle>
                  {path.category && (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0">
                      {path.category}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm text-gray-600 font-medium">
                  Why this fits you:
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Why You - Personalized bullets */}
                <ul className="space-y-2">
                  {path.why_you.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Time to Income</p>
                      <p className="text-sm font-semibold text-gray-900">{formatTimeToIncome(path)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Startup Cost</p>
                      <p className="text-sm font-semibold text-gray-900">{formatStartupCost(path)}</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty/Risk Level */}
                {(path.risk_level || path.difficulty) && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 font-medium">Difficulty:</span>
                    <Badge
                      variant="outline"
                      className={`${getRiskColor(path.risk_level || path.difficulty || '')} border font-semibold`}
                    >
                      {(path.difficulty || path.risk_level || 'Medium')}
                    </Badge>
                  </div>
                )}

                {/* First Win */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 mb-1">First Win:</p>
                      <p className="text-sm text-indigo-800">{path.first_win}</p>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <Button
                  onClick={() => handleSelectPath(path)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Select This Path
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Refine Further Button */}
        <div className="text-center">
          <Button
            onClick={handleRefineFurther}
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg font-semibold border-2 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
          >
            🔄 Refine Further
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Not quite right? Let us fine-tune these options for you
          </p>
        </div>
      </div>
    </div>
  )
}
