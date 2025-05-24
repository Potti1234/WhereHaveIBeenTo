'use client'

import { Activity } from '@/schemas/activity-schema'
import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { MapPin, Star, XIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const ActivityComponent = ({ node, deleteNode }: NodeViewProps) => {
  const attrs = node.attrs as Activity

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
              alt={attrs.title || 'Activity image'}
            />
            <AvatarFallback className='rounded-md'>
              {attrs.title?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2 font-medium text-base'>
              <MapPin className='h-5 w-5 text-primary' />
              <span>{attrs.title || 'Activity Name'}</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              {attrs.description || 'No description available.'}
            </div>
            <div className='flex items-center'>
              <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
              <span className='ml-1 text-xs text-muted-foreground'>
                {attrs.review_stars || 0} reviews
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <div className='font-semibold text-sm'>
                {attrs.price ? `$${attrs.price}` : 'Price not available'}
              </div>
              {attrs.duration && (
                <div className='text-xs text-muted-foreground'>
                  Duration: {attrs.duration}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  )
}

export default Node.create({
  name: 'activityBlock',
  group: 'block',
  atom: true,

  addAttributes () {
    const defaults: Activity = {
      id: undefined,
      title: 'Activity Name',
      description: 'Location',
      price: 0,
      duration: 0,
      review_stars: 0,
      image: '/placeholder.svg?height=100&width=150'
    }
    return defaults
  },

  parseHTML () {
    return [
      {
        tag: 'div[data-type="activity-block"]'
      }
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'activity-block' })
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(ActivityComponent)
  }
})
