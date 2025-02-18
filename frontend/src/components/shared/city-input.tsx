import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useCity } from '@/hooks/use-city'
import type { CityWithCountryAndState } from '@/schemas/city-schema'

interface CityInputProps {
  onSelect: (city: CityWithCountryAndState) => void
  placeholder?: string
  selectedCityId?: string | null
}

export function CityInput ({
  onSelect,
  placeholder = 'Select a city...',
  selectedCityId
}: CityInputProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [cities, setCities] = React.useState<CityWithCountryAndState[]>([])
  const { searchCities, searchCityById } = useCity(selectedCityId || '')

  const fetchCities = async (input: string) => {
    if (!input) return
    const results = await searchCities(input)
    setCities(results)
  }

  const selectedCity = searchCityById

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {selectedCity ? (
            <span>
              <img
                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedCity.expand?.country?.iso2}.svg`}
                alt='Flag'
                className='mr-2 h-4 w-4 inline-block'
              />
              {`${selectedCity.name}`}
            </span>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0'>
        <Command>
          <CommandInput
            placeholder='Search cities...'
            value={searchTerm}
            onValueChange={(value: string) => {
              setSearchTerm(value)
              fetchCities(value)
            }}
          />
          <CommandEmpty>No cities found.</CommandEmpty>
          <CommandGroup className='max-h-[300px] overflow-auto'>
            {cities.map(city => (
              <CommandItem
                key={city.id}
                value={`${city.name} ${city.expand?.country?.iso2 || ''} ${
                  city.expand?.state?.name || ''
                }`}
                onSelect={() => {
                  onSelect(city)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedCity?.id === city.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
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
        </Command>
      </PopoverContent>
    </Popover>
  )
}
