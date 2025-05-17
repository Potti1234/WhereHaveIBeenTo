'use client'

import { useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import History from '@tiptap/extension-history'
import EditorToolbar from './editor-toolbar'
import FlightExtension from './extensions/flight-extension'
import HotelExtension from './extensions/hotel-extension'
import ActivityExtension from './extensions/activity-extension'
import MapExtension from './extensions/map-extension'
import { SlashCommand } from './extensions/slash-command-extension'

interface FlightAttributes {
  id: number
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  price: string
  date: string
}

interface HotelAttributes {
  id: number
  name: string
  location: string
  price: string
  rating: number
  image?: string
}

interface ActivityAttributes {
  id: number
  name: string
  location: string
  price: string
  duration: string
  rating: number
  image?: string
}

interface SearchProps<T> {
  onSelect: (item: T) => void
  onClose: () => void
}

export default function TravelEditor () {
  const [showFlightSearch, setShowFlightSearch] = useState(false)
  const [showHotelSearch, setShowHotelSearch] = useState(false)
  const [showActivitySearch, setShowActivitySearch] = useState(false)

  const commandActions = {
    addFlight: () => setShowFlightSearch(true),
    addHotel: () => setShowHotelSearch(true),
    addActivity: () => setShowActivitySearch(true),
    addMap: () => {
      editor?.commands.insertContent({
        type: 'mapBlock',
        attrs: {}
      })
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false
      }),
      History.configure({
        depth: 100,
        newGroupDelay: 500
      }),
      Placeholder.configure({
        placeholder: 'Type / for commands or start planning your trip...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      FlightExtension,
      HotelExtension,
      ActivityExtension,
      MapExtension,
      SlashCommand.configure({
        commandActions
      })
    ],
    content: `
      <h1>Start Planning Your Trip</h1>
      <p>Use the toolbar above or type <strong>/</strong> to add flights, hotels, activities, and more to your travel plan.</p>
    `,
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none p-4 overflow-y-auto h-full w-full'
      }
    }
  }) as Editor

  const insertFlight = (flight: FlightAttributes) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'flightBlock',
        attrs: flight
      })
      .run()
    setShowFlightSearch(false)
  }

  const insertHotel = (hotel: HotelAttributes) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'hotelBlock',
        attrs: hotel
      })
      .run()
    setShowHotelSearch(false)
  }

  const insertActivity = (activity: ActivityAttributes) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'activityBlock',
        attrs: activity
      })
      .run()
    setShowActivitySearch(false)
  }

  return (
    <div className='container mx-auto p-4 space-y-6 h-screen flex flex-col'>
      <EditorToolbar
        editor={editor}
        onFlightClick={() => setShowFlightSearch(true)}
        onHotelClick={() => setShowHotelSearch(true)}
        onActivityClick={() => setShowActivitySearch(true)}
        onMapClick={commandActions.addMap}
      />

      <div className='flex-1 overflow-y-auto relative min-h-0'>
        <EditorContent editor={editor} className='h-full' />
      </div>

      {showFlightSearch && (
        <FlightSearch
          onSelect={insertFlight}
          onClose={() => setShowFlightSearch(false)}
        />
      )}

      {showHotelSearch && (
        <HotelSearch
          onSelect={insertHotel}
          onClose={() => setShowHotelSearch(false)}
        />
      )}

      {showActivitySearch && (
        <ActivitySearch
          onSelect={insertActivity}
          onClose={() => setShowActivitySearch(false)}
        />
      )}
    </div>
  )
}

function FlightSearch ({ onSelect, onClose }: SearchProps<FlightAttributes>) {
  const flights: FlightAttributes[] = [
    {
      id: 1,
      airline: 'Japan Airlines',
      flightNumber: 'JL7002',
      departure: 'Tokyo',
      arrival: 'Osaka',
      departureTime: '10:30 AM',
      arrivalTime: '11:45 AM',
      price: '$120',
      date: '2025-06-05'
    },
    {
      id: 2,
      airline: 'ANA',
      flightNumber: 'NH105',
      departure: 'Tokyo',
      arrival: 'Kyoto',
      departureTime: '1:20 PM',
      arrivalTime: '2:30 PM',
      price: '$140',
      date: '2025-06-08'
    },
    {
      id: 3,
      airline: 'Japan Airlines',
      flightNumber: 'JL301',
      departure: 'Osaka',
      arrival: 'Sapporo',
      departureTime: '11:05 AM',
      arrivalTime: '1:15 PM',
      price: '$180',
      date: '2025-06-12'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Search Flights</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mb-4 grid grid-cols-4 gap-2'>
          <input
            type='text'
            placeholder='From'
            className='p-2 border rounded'
            defaultValue='Tokyo'
          />
          <input
            type='text'
            placeholder='To'
            className='p-2 border rounded'
            defaultValue='Osaka'
          />
          <input
            type='date'
            className='p-2 border rounded'
            defaultValue='2025-06-05'
          />
          <button className='bg-blue-600 text-white p-2 rounded'>Search</button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {flights.map(flight => (
            <div
              key={flight.id}
              className='border rounded p-3 mb-2 hover:bg-gray-50 cursor-pointer'
              onClick={() => onSelect(flight)}
            >
              <div className='flex justify-between'>
                <div className='font-medium'>
                  {flight.airline} {flight.flightNumber}
                </div>
                <div className='font-bold'>{flight.price}</div>
              </div>
              <div className='flex justify-between mt-2'>
                <div>
                  <div className='text-lg font-semibold'>
                    {flight.departureTime}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {flight.departure}
                  </div>
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
                  <div className='text-lg font-semibold'>
                    {flight.arrivalTime}
                  </div>
                  <div className='text-sm text-gray-600'>{flight.arrival}</div>
                </div>
              </div>
              <div className='text-sm text-gray-500 mt-1'>{flight.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HotelSearch ({ onSelect, onClose }: SearchProps<HotelAttributes>) {
  const hotels: HotelAttributes[] = [
    {
      id: 1,
      name: 'Park Hyatt Tokyo',
      location: 'Tokyo',
      price: '$350/night',
      rating: 4.8,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 2,
      name: 'Conrad Osaka',
      location: 'Osaka',
      price: '$320/night',
      rating: 4.7,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 3,
      name: 'The Ritz-Carlton Kyoto',
      location: 'Kyoto',
      price: '$420/night',
      rating: 4.9,
      image: '/placeholder.svg?height=100&width=150'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Search Hotels</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mb-4 grid grid-cols-4 gap-2'>
          <input
            type='text'
            placeholder='Destination'
            className='p-2 border rounded col-span-2'
            defaultValue='Tokyo'
          />
          <input
            type='date'
            className='p-2 border rounded'
            defaultValue='2025-06-01'
          />
          <button className='bg-blue-600 text-white p-2 rounded'>Search</button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {hotels.map(hotel => (
            <div
              key={hotel.id}
              className='border rounded p-3 mb-2 hover:bg-gray-50 cursor-pointer flex'
              onClick={() => onSelect(hotel)}
            >
              <img
                src={hotel.image || '/placeholder.svg'}
                alt={hotel.name}
                className='w-24 h-24 object-cover rounded mr-3'
              />
              <div className='flex-1'>
                <div className='font-medium text-lg'>{hotel.name}</div>
                <div className='text-sm text-gray-600'>{hotel.location}</div>
                <div className='flex items-center mt-1'>
                  <div className='text-yellow-500'>★</div>
                  <div className='ml-1 text-sm'>{hotel.rating}</div>
                </div>
                <div className='font-bold mt-1'>{hotel.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivitySearch ({
  onSelect,
  onClose
}: SearchProps<ActivityAttributes>) {
  const activities: ActivityAttributes[] = [
    {
      id: 1,
      name: 'Tokyo Skytree Tour',
      location: 'Tokyo',
      price: '$25',
      duration: '2 hours',
      rating: 4.6,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 2,
      name: 'Fushimi Inari Shrine Visit',
      location: 'Kyoto',
      price: '$15',
      duration: '3 hours',
      rating: 4.9,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 3,
      name: 'Osaka Castle Tour',
      location: 'Osaka',
      price: '$20',
      duration: '2 hours',
      rating: 4.7,
      image: '/placeholder.svg?height=100&width=150'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Search Activities</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mb-4 grid grid-cols-4 gap-2'>
          <input
            type='text'
            placeholder='Location'
            className='p-2 border rounded col-span-2'
            defaultValue='Tokyo'
          />
          <input
            type='text'
            placeholder='Activity type'
            className='p-2 border rounded'
          />
          <button className='bg-blue-600 text-white p-2 rounded'>Search</button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {activities.map(activity => (
            <div
              key={activity.id}
              className='border rounded p-3 mb-2 hover:bg-gray-50 cursor-pointer flex'
              onClick={() => onSelect(activity)}
            >
              <img
                src={activity.image || '/placeholder.svg'}
                alt={activity.name}
                className='w-24 h-24 object-cover rounded mr-3'
              />
              <div className='flex-1'>
                <div className='font-medium text-lg'>{activity.name}</div>
                <div className='text-sm text-gray-600'>{activity.location}</div>
                <div className='flex items-center mt-1'>
                  <div className='text-yellow-500'>★</div>
                  <div className='ml-1 text-sm'>{activity.rating}</div>
                </div>
                <div className='flex justify-between mt-1'>
                  <div className='font-bold'>{activity.price}</div>
                  <div className='text-sm text-gray-600'>
                    {activity.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
