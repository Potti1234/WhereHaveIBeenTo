'use client'

import { Activity } from '@/schemas/activity-schema'
import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { MapPin } from 'lucide-react'

const ActivityComponent = ({ node, deleteNode }: NodeViewProps) => {
  const attrs = node.attrs as Activity
  console.log(attrs)

  return (
    <NodeViewWrapper>
      <div className='my-4 p-4 border rounded-lg bg-gray-50 flex'>
        <img
          src={attrs.image || '/placeholder.svg'}
          alt={attrs.title || ''}
          className='w-24 h-24 object-cover rounded mr-4'
        />

        <div className='flex-1'>
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center'>
              <MapPin className='h-5 w-5 mr-2 text-blue-600' />
              <span className='font-medium'>Activity</span>
            </div>
            <button
              onClick={deleteNode}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>

          <div className='font-medium text-lg'>{attrs.title}</div>
          <div className='text-sm text-gray-600'>{attrs.description}</div>
          <div className='flex items-center mt-1'>
            <div className='text-yellow-500'>★</div>
            <div className='ml-1 text-sm'>{attrs.review_stars}</div>
          </div>
          <div className='flex justify-between mt-1'>
            <div className='font-bold'>{attrs.price}</div>
            <div className='text-sm text-gray-600'>{attrs.duration}</div>
          </div>
        </div>
      </div>
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
    console.log(defaults)
    return {
      defaults
    }
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
