'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { Plane, XIcon, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const FlightComponent = ({ node, deleteNode }: NodeViewProps) => {
  const attrs = node.attrs

  return (
    <NodeViewWrapper>
      <Card className='my-4 relative'>
        <CardContent className='p-4 pt-10 space-y-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={deleteNode}
            className='absolute top-2 right-2'
          >
            <XIcon className='h-4 w-4' />
          </Button>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2 text-base font-semibold'>
              <Plane className='h-5 w-5 text-primary' />
              <span>
                {attrs.airline} {attrs.flightNumber}
              </span>
            </div>
            <div className='font-bold text-sm'>{attrs.price}</div>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                {/* Placeholder for airline logo or initials */}
                <AvatarFallback>
                  {attrs.airline?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='font-medium'>{attrs.departureTime}</div>
                <div className='text-muted-foreground'>{attrs.departure}</div>
              </div>
            </div>

            <ArrowRight className='h-5 w-5 text-muted-foreground mx-2 md:mx-4' />

            <div className='flex items-center gap-2 text-right'>
              <div>
                <div className='font-medium'>{attrs.arrivalTime}</div>
                <div className='text-muted-foreground'>{attrs.arrival}</div>
              </div>
              {/* Could add another avatar for arrival airport if needed */}
            </div>
          </div>
          <div className='text-xs text-muted-foreground pt-1'>{attrs.date}</div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  )
}

export default Node.create({
  name: 'flightBlock',
  group: 'block',
  atom: true,

  addAttributes () {
    return {
      id: { default: null },
      airline: { default: 'Airline' },
      flightNumber: { default: 'XX000' },
      departure: { default: 'DEP' },
      arrival: { default: 'ARR' },
      departureTime: { default: '00:00' },
      arrivalTime: { default: '00:00' },
      price: { default: '$0' },
      date: { default: 'YYYY-MM-DD' }
    }
  },

  parseHTML () {
    return [
      {
        tag: 'div[data-type="flight-block"]'
      }
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'flight-block' })
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(FlightComponent)
  }
})
