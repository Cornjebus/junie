'use client'

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/ui/icons'
import { useEffect, useRef } from 'react'

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat with Junie</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg font-medium mb-2">Welcome to Junie!</p>
                <p className="text-sm">Start a conversation by typing a message below.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20">
                  <p className="text-sm">Error: {error.message}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
