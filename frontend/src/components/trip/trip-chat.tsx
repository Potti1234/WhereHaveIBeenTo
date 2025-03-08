'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export default function TripChat () {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    const maxHeight = 350
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement chat functionality
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 mx-auto px-4 z-1000'>
      <Card className='w-full md:w-1/2 mx-auto shadow-lg'>
        <div className='p-4'>
          <div className='relative flex items-start gap-2'>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ask anything...'
              className='pr-10 min-h-[44px] resize-none'
              rows={1}
              maxLength={1000}
            />
            <Button
              type='submit'
              size='icon'
              className='absolute right-0 bottom-0'
              onClick={handleSubmit}
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
