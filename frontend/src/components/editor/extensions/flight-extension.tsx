'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { Plane } from 'lucide-react'

const FlightComponent = ({ node, deleteNode }: NodeViewProps) => {
  const attrs = node.attrs

  return (
    <NodeViewWrapper>
      <div className='my-4 p-4 border rounded-lg bg-gray-50 flex flex-col'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center'>
            <Plane className='h-5 w-5 mr-2 text-blue-600' />
            <span className='font-medium'>Flight</span>
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

        <div className='flex justify-between items-center'>
          <div className='text-lg font-semibold'>
            {attrs.airline} {attrs.flightNumber}
          </div>
          <div className='font-bold'>{attrs.price}</div>
        </div>

        <div className='flex justify-between mt-2'>
          <div>
            <div className='text-lg font-semibold'>{attrs.departureTime}</div>
            <div className='text-sm text-gray-600'>{attrs.departure}</div>
          </div>
          <div className='flex items-center text-gray-400'>
            <div className='border-t border-gray-300 w-16'></div>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mx-1'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.429a1 1 0 01.725-1.962l5 1.429a1 1 0 00.725-.038l5-1.429a1 1 0 011.169 1.409l-7 14z' />
            </svg>
            <div className='border-t border-gray-300 w-16'></div>
          </div>
          <div>
            <div className='text-lg font-semibold'>{attrs.arrivalTime}</div>
            <div className='text-sm text-gray-600'>{attrs.arrival}</div>
          </div>
        </div>

        <div className='text-sm text-gray-500 mt-1'>{attrs.date}</div>
      </div>
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
