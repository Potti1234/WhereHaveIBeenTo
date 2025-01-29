import Control from 'react-leaflet-custom-control'
import { Pencil, Earth, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function MapScopeSelector (props: {
  scopeCallback: (scope: string) => void
}) {
  return (
    <Control position='topright'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='default' className='w-9 px-0'>
            <Pencil className='absolute h-[1.2rem] w-[1.2rem] transition-all' />
            <span className='sr-only'>Toggle shown data</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => props.scopeCallback('cities')}>
            <MapPin className='mr-2 h-4 w-4' />
            Cities
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.scopeCallback('countries')}>
            <Earth className='mr-2 h-4 w-4' />
            Countries
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Control>
  )
}
