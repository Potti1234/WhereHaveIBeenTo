import { Extension } from '@tiptap/core'
import { Editor } from '@tiptap/react'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps
} from '@tiptap/suggestion'
import tippy, { Instance as TippyInstance, Props as TippyProps } from 'tippy.js'
import {
  Plane,
  Hotel as HotelIcon,
  MapPin as ActivityIcon,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  DollarSign
} from 'lucide-react'

import CommandListComponent, { CommandListRef } from './CommandList'
import React from 'react'

export interface CommandItemProps {
  title: string
  action: (props: { editor: Editor; range: any }) => void
  icon?: React.ReactNode
}

const getItems = (
  query: string,
  commandActions: Record<string, (props?: any) => void>
): CommandItemProps[] => {
  const basicItems: CommandItemProps[] = [
    {
      title: 'Heading 1',
      icon: <Heading1 size={18} />,
      action: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      }
    },
    {
      title: 'Heading 2',
      icon: <Heading2 size={18} />,
      action: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      }
    },
    {
      title: 'Heading 3',
      icon: <Heading3 size={18} />,
      action: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run()
      }
    },
    {
      title: 'Bulleted List',
      icon: <List size={18} />,
      action: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Numbered List',
      icon: <ListOrdered size={18} />,
      action: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      title: 'Quote',
      icon: <Quote size={18} />,
      action: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      }
    }
  ]

  const travelItems: CommandItemProps[] = [
    {
      title: 'Flight',
      icon: <Plane size={18} />,
      action: () => commandActions.addFlight()
    },
    {
      title: 'Hotel',
      icon: <HotelIcon size={18} />,
      action: () => commandActions.addHotel()
    },
    {
      title: 'Activity',
      icon: <ActivityIcon size={18} />,
      action: () => commandActions.addActivity()
    },
    {
      title: 'Map',
      icon: <Globe size={18} />,
      action: () => commandActions.addMap()
    },
    {
      title: 'Currency Converter',
      icon: <DollarSign size={18} />,
      action: () => commandActions.addCurrencyConverter()
    }
  ]

  const allItems = [...travelItems, ...basicItems]

  if (!query) {
    return allItems
  }

  return allItems
    .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10)
}

const SlashCommandSuggestionOptions: Partial<
  SuggestionOptions<CommandItemProps>
> = {
  char: '/',
  allowSpaces: false,
  startOfLine: false,
  command: ({ editor, range, props }) => {
    props.action({ editor, range })
    if (
      ['Flight', 'Hotel', 'Activity', 'Currency Converter', 'Map'].includes(
        props.title
      )
    ) {
      editor.chain().focus().deleteRange(range).run()
    }
  },
  render: () => {
    let component: ReactRenderer<CommandListRef, any>
    let popup: TippyInstance<TippyProps>[]

    return {
      onStart: (props: SuggestionProps<CommandItemProps>) => {
        component = new ReactRenderer(CommandListComponent, {
          props: { ...props, editor: props.editor },
          editor: props.editor
        })

        const { clientRect } = props
        if (!clientRect) {
          return
        }

        popup = tippy('body' as any, {
          getReferenceClientRect:
            clientRect as TippyProps['getReferenceClientRect'],
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start'
        })
      },
      onUpdate: (props: SuggestionProps<CommandItemProps>) => {
        component.updateProps({ ...props, editor: props.editor })

        const { clientRect } = props
        if (!clientRect) {
          return
        }

        if (popup && popup[0]) {
          popup[0].setProps({
            getReferenceClientRect:
              clientRect as TippyProps['getReferenceClientRect']
          })
        }
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          if (popup && popup[0]) {
            popup[0].hide()
          }
          return true
        }
        return (
          (component.ref as CommandListRef)?.onKeyDown({
            event: props.event
          }) ?? false
        )
      },
      onExit: () => {
        if (popup && popup[0]) {
          popup[0].destroy()
        }
        if (component) {
          component.destroy()
        }
      }
    }
  }
}

interface SlashCommandOptions {
  commandActions: Record<string, (props?: any) => void>
  suggestion: Partial<SuggestionOptions<CommandItemProps>>
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions (): Omit<SlashCommandOptions, 'commandActions'> & {
    commandActions: Record<string, (props?: any) => void>
  } {
    return {
      commandActions: {
        addFlight: () => {
          console.warn('addFlight not implemented')
        },
        addHotel: () => {
          console.warn('addHotel not implemented')
        },
        addActivity: () => {
          console.warn('addActivity not implemented')
        },
        addMap: () => {
          console.warn('addMap not implemented')
        },
        addCurrencyConverter: () => {
          console.warn('addCurrencyConverter not implemented')
        }
      },
      suggestion: SlashCommandSuggestionOptions
    }
  },

  addProseMirrorPlugins () {
    const { editor } = this
    const { suggestion, commandActions } = this.options

    return [
      Suggestion<CommandItemProps>({
        editor: editor as Editor,
        ...suggestion,
        items: ({ query }) => getItems(query, commandActions)
      })
    ]
  }
})
