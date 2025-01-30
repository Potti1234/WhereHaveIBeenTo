'use client'

import React from 'react'
import { DialogProps } from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import useAuth from '@/hooks/use-auth'
import { useCity } from '@/hooks/use-city'
import { useVisitedCity } from '@/hooks/use-visited-city'
import type { CityWithCountryAndState } from '@/schemas/city-schema'

export default function CitySelector ({ ...props }: DialogProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const { user } = useAuth()
  const { searchCities } = useCity('')
  const { addVisitedCity, isAdding } = useVisitedCity(user?.id || '')
  const [cities, setCities] = React.useState<CityWithCountryAndState[]>([])

  const fetchCities = async (input: string) => {
    if (!input) return
    const results = await searchCities(input)
    setCities(results)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'a' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          'relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className='hidden lg:inline-flex'>Search city...</span>
        <span className='inline-flex lg:hidden'>Search...</span>
        <kbd className='pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>⌘</span>A
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Type a city or search...'
          value={searchTerm}
          onValueChange={(value: string) => {
            setSearchTerm(value)
            fetchCities(value)
          }}
        />
        <CommandList>
          <CommandEmpty>No Cities found.</CommandEmpty>
          <CommandGroup heading='Cities'>
            {cities.map(city => (
              <CommandItem
                key={city.id}
                value={`${city.name} ${city.expand?.country?.iso2 || ''} ${
                  city.expand?.state?.name || ''
                }`}
                onSelect={() => {
                  if (city.id) {
                    runCommand(() => addVisitedCity(city.id))
                  }
                }}
                disabled={isAdding}
              >
                <Plus className='mr-2 h-4 w-4' />
                {city.expand?.country?.iso2 && (
                  <img
                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${city.expand.country.iso2}.svg`}
                    alt='Flag'
                    className='mr-2 h-4 w-4'
                  />
                )}
                {`${city.name} / ${city.expand?.state?.name || 'N/A'} / ${
                  city.expand?.country?.name || 'N/A'
                }`}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
