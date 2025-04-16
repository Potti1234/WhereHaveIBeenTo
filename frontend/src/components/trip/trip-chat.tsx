'use client'

import { useState, useRef, useEffect, SetStateAction, Dispatch } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { createTrip } from '@/services/api-planner'
import { ExpandedTripType, ExpandedTravelItemType } from '@/schemas/trip-schema'

interface TripChatProps {
  setTrip: Dispatch<SetStateAction<ExpandedTripType>>
  setTravelItems: Dispatch<SetStateAction<ExpandedTravelItemType[]>>
}

export default function TripChat (props: TripChatProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault()
    const trip = await createTrip(message)
    setMessage('')
    setIsLoading(false)
    props.setTrip(trip)
    props.setTravelItems(trip.expand.travel_items)
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
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
