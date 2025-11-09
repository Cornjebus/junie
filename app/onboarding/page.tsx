'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState<'sparks' | 'values' | 'dream'>('sparks')
  const [sparks, setSparks] = useState<string[]>([])
  const [customSpark, setCustomSpark] = useState('')
  const [values, setValues] = useState<string[]>([])
  const [dream, setDream] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Predefined options
  const sparkOptions = [
    'Writing', 'Design', 'Teaching', 'Coding', 'Marketing', 'Sales',
    'Consulting', 'Video', 'Photography', 'Public Speaking', 'Coaching',
    'Data Analysis', 'Project Management', 'Community Building', 'Content Creation',
    'Product Design', 'Research', 'Strategy', 'Operations', 'Customer Success'
  ]

  const valueOptions = [
    'Freedom', 'Impact', 'Creativity', 'Learning', 'Helping Others', 'Innovation',
    'Stability', 'Adventure', 'Recognition', 'Collaboration', 'Independence', 'Growth'
  ]

  const toggleSpark = (spark: string) => {
    setSparks(prev =>
      prev.includes(spark) ? prev.filter(s => s !== spark) : [...prev, spark]
    )
  }

  const addCustomSpark = () => {
    if (customSpark.trim() && !sparks.includes(customSpark.trim())) {
      setSparks([...sparks, customSpark.trim()])
      setCustomSpark('')
    }
  }

  const toggleValue = (value: string) => {
    setValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value)
      }
      if (prev.length < 3) {
        return [...prev, value]
      }
      return prev
    })
  }

  const canProgress = () => {
    if (step === 'sparks') return sparks.length > 0
    if (step === 'values') return values.length >= 1 && values.length <= 3
    if (step === 'dream') return dream.length >= 20
    return false
  }

  const handleNext = () => {
    if (step === 'sparks') setStep('values')
    else if (step === 'values') setStep('dream')
    else handleSubmit()
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found')
      return
    }

    console.log('Submitting onboarding:', { sparks, values, dream })
    setIsSubmitting(true)

    try {
      const url = `${window.location.origin}/api/onboarding/submit`
      console.log('Fetching:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sparks,
          values,
          dream,
        }),
        credentials: 'same-origin',
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers.get('content-type'))

      const data = await response.json()
      console.log('Response:', response.status, data)

      if (response.ok) {
        console.log('Onboarding saved! Redirecting to options...')
        router.push('/options')
      } else {
        console.error('Failed to save onboarding data:', data)
        alert(`Error: ${data.error || 'Failed to save'}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      alert('Error submitting onboarding. Check console.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {step === 'sparks' && '✨ What Makes You Come Alive?'}
            {step === 'values' && '🎯 What Matters Most?'}
            {step === 'dream' && '🌟 What Do You Dream Of?'}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {step === 'sparks' && 'Select the activities that energize you (pick as many as you want)'}
            {step === 'values' && 'Choose 1-3 core values that guide your decisions'}
            {step === 'dream' && 'Describe what success looks like for you'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-6">
            <div className={`h-2 w-20 rounded-full ${step === 'sparks' ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-20 rounded-full ${step === 'values' ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-20 rounded-full ${step === 'dream' ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          </div>

          {/* Sparks step */}
          {step === 'sparks' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {sparkOptions.map(spark => (
                  <Badge
                    key={spark}
                    variant={sparks.includes(spark) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm px-3 py-1"
                    onClick={() => toggleSpark(spark)}
                  >
                    {spark}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Input
                  placeholder="Add your own..."
                  value={customSpark}
                  onChange={(e) => setCustomSpark(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSpark()}
                />
                <Button onClick={addCustomSpark} variant="outline">Add</Button>
              </div>

              {sparks.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected: {sparks.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Values step */}
          {step === 'values' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {valueOptions.map(value => (
                  <Badge
                    key={value}
                    variant={values.includes(value) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm px-3 py-1"
                    onClick={() => toggleValue(value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {values.length === 0 && 'Select 1-3 values'}
                {values.length > 0 && values.length < 3 && `${values.length} selected (you can pick up to 3)`}
                {values.length === 3 && '3 selected (max reached)'}
              </div>
            </div>
          )}

          {/* Dream step */}
          {step === 'dream' && (
            <div className="space-y-4">
              <Label htmlFor="dream">
                In 6-12 months, what would success look like for you?
              </Label>
              <Textarea
                id="dream"
                placeholder="I want to make more money doing work I love by..."
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                rows={6}
                maxLength={180}
                className="resize-none"
              />
              <div className="text-sm text-gray-600 text-right">
                {dream.length}/180 characters {dream.length < 20 && `(minimum 20)`}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 pt-4">
            {step !== 'sparks' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'values') setStep('sparks')
                  else if (step === 'dream') setStep('values')
                }}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProgress() || isSubmitting}
              className="flex-1"
            >
              {step === 'dream' ? (isSubmitting ? 'Generating Your Options...' : 'See My Options') : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
