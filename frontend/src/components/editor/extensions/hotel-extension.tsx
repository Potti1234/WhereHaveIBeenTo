'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { Hotel as HotelIcon, Star, XIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const HotelComponent = ({ node, deleteNode }: NodeViewProps) => {
  const attrs = node.attrs

  return (
    <NodeViewWrapper>
      <Card className='my-4 relative'>
        <CardContent className='p-4 pt-10 flex gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={deleteNode}
            className='absolute top-2 right-2'
          >
            <XIcon className='h-4 w-4' />
          </Button>
          <Avatar className='h-24 w-24 rounded-md'>
            <AvatarImage
              src={attrs.image || undefined}
              alt={attrs.name || 'Hotel image'}
            />
            <AvatarFallback className='rounded-md'>
              {attrs.name?.charAt(0) || 'H'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2 font-medium text-base'>
              <HotelIcon className='h-5 w-5 text-primary' />
              <span>{attrs.name || 'Hotel Name'}</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              {attrs.location || 'Location not specified'}
            </div>
            <div className='flex items-center'>
              <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
              <span className='ml-1 text-xs text-muted-foreground'>
                {attrs.rating || '0.0'}
              </span>
            </div>
            <div className='font-semibold text-sm pt-1'>
              {attrs.price || 'Price not available'}
            </div>
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  )
}

const HotelExtension = Node.create({
  name: 'hotelBlock',
  group: 'block',
  atom: true,

  addAttributes () {
    return {
      id: { default: null },
      name: { default: 'Hotel Name' },
      location: { default: 'Location' },
      price: { default: '$0/night' },
      rating: { default: '0.0' },
      image: { default: '/placeholder.svg?height=100&width=150' }
    }
  },

  parseHTML () {
    return [
      {
        tag: 'div[data-type="hotel-block"]'
      }
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'hotel-block' })
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(HotelComponent)
  }
})

export default HotelExtension
