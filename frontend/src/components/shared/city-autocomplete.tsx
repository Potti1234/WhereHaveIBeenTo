import * as React from 'react'
import type { CityWithCountryAndState } from '@/schemas/city-schema'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCitiesThatStartWith, getSearchCityById } from '@/services/api-city'

interface CityAutocompleteProps {
  onSelect: (city: CityWithCountryAndState) => void
  placeholder?: string
  selectedCityId?: string | null
  disabled?: boolean
}

export function CityAutocomplete ({
  onSelect,
  placeholder = 'Search cities...',
  selectedCityId,
  disabled
}: CityAutocompleteProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [cities, setCities] = React.useState<CityWithCountryAndState[]>([])
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [fetchedSelectedCity, setFetchedSelectedCity] =
    React.useState<CityWithCountryAndState | null>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (selectedCityId) {
      getSearchCityById(selectedCityId).then(city => {
        if (city) {
          setFetchedSelectedCity(city)
          setSearchTerm(city.name || '')
        }
      })
    } else {
      setFetchedSelectedCity(null)
    }
  }, [selectedCityId])

  React.useEffect(() => {
    if (searchTerm) {
      getCitiesThatStartWith(searchTerm).then(setCities)
      setShowDropdown(true)
    } else {
      setCities([])
      setShowDropdown(false)
    }
  }, [searchTerm])

  const handleSelect = (city: CityWithCountryAndState) => {
    onSelect(city)
    setSearchTerm(city.name || '')
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick (e: MouseEvent) {
      if (!inputRef.current?.parentElement?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className='relative w-full'>
      <Input
        ref={inputRef}
        type='text'
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        disabled={disabled}
        autoComplete='off'
        onFocus={() => searchTerm && setShowDropdown(true)}
      />
      {showDropdown && (
        <div className='absolute z-10 mt-1 w-full bg-background border rounded shadow max-h-60 overflow-auto'>
          {cities.length === 0 ? (
            <div className='p-2 text-muted-foreground'>No cities found.</div>
          ) : (
            cities.map(city => (
              <div
                key={city.id}
                className={cn(
                  'flex items-center px-3 py-2 cursor-pointer hover:bg-accent',
                  fetchedSelectedCity?.id === city.id && 'bg-accent'
                )}
                onClick={() => handleSelect(city)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    fetchedSelectedCity?.id === city.id
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
                {city.expand?.country?.iso2 && (
                  <img
                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${city.expand.country.iso2}.svg`}
                    alt='Flag'
                    className='mr-2 h-4 w-4'
                  />
                )}
                {`${city.name} / ${city.expand?.state?.name || ''} ${
                  city.expand?.country?.name || 'N/A'
                }`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
