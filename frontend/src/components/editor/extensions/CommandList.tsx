'use client'

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react'
import { SuggestionProps } from '@tiptap/suggestion'
import { CommandItemProps } from './slash-command-extension' // This will be created next

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

interface CommandListForwardRefProps extends SuggestionProps<CommandItemProps> {
  // items, command, editor, range, clientRect are from SuggestionProps
}

const CommandListComponent = forwardRef<
  CommandListRef,
  CommandListForwardRefProps
>((props: CommandListForwardRefProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index]
      if (item) {
        props.command(item) // Executes the command for the selected item
      }
    },
    [props]
  )

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(
          (selectedIndex + props.items.length - 1) % props.items.length
        )
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    }
  }))

  if (props.items.length === 0) {
    return null
  }

  return (
    <div
      className='bg-white shadow-xl rounded-md p-1 border border-gray-200 overflow-hidden'
      style={{ minWidth: '200px' }}
    >
      <ul className='divide-y divide-gray-100'>
        {props.items.map((item, index) => (
          <li
            key={item.title}
            className={`flex items-center p-2 rounded-sm hover:bg-gray-100 cursor-pointer ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)} // Update selection on mouse hover
          >
            {item.icon && <span className='mr-2 opacity-70'>{item.icon}</span>}
            <span className='text-sm'>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})

CommandListComponent.displayName = 'CommandList'
export default CommandListComponent
