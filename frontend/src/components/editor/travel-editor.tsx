'use client'

import { useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import History from '@tiptap/extension-history'
import Document from '@tiptap/extension-document'
import EditorToolbar from './editor-toolbar'
import FlightExtension from './extensions/flight-extension'
import HotelExtension from './extensions/hotel-extension'
import ActivityExtension from './extensions/activity-extension'
import MapExtension from './extensions/map-extension'
import { SlashCommand } from './extensions/slash-command-extension'
import FlightSearch from './flight-search'
import HotelSearch from './hotel-search'
import ActivitySearch from './activity-search'
import { FlightAttributes, HotelAttributes, ActivityAttributes } from './types'

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

  const CustomDocument = Document.extend({
    content: 'heading block*'
  })

  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        history: false,
        document: false
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
          open={showFlightSearch}
        />
      )}

      {showHotelSearch && (
        <HotelSearch
          onSelect={insertHotel}
          onClose={() => setShowHotelSearch(false)}
          open={showHotelSearch}
        />
      )}

      {showActivitySearch && (
        <ActivitySearch
          onSelect={insertActivity}
          onClose={() => setShowActivitySearch(false)}
          open={showActivitySearch}
        />
      )}
    </div>
  )
}
