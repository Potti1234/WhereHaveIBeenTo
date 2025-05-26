'use client'

import * as React from 'react'
import type { Currency } from '@/schemas/currency-schema'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurrencyAutocompleteProps {
  allCurrencies: Currency[] | null
  selectedCurrencyCode: string
  onSelectCurrency: (code: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CurrencyAutocomplete ({
  allCurrencies,
  selectedCurrencyCode,
  onSelectCurrency,
  placeholder = 'Search currencies...',
  disabled
}: CurrencyAutocompleteProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filteredCurrencies, setFilteredCurrencies] = React.useState<
    Currency[]
  >([])
  const [showDropdown, setShowDropdown] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    // Pre-fill search term if a currency is already selected
    if (selectedCurrencyCode && allCurrencies) {
      const selected = allCurrencies.find(c => c.code === selectedCurrencyCode)
      setSearchTerm(selected?.name || selected?.code || '')
    } else {
      setSearchTerm('')
    }
  }, [selectedCurrencyCode, allCurrencies])

  React.useEffect(() => {
    if (!allCurrencies) {
      setFilteredCurrencies([])
      return
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      setFilteredCurrencies(
        allCurrencies.filter(
          currency =>
            currency.code?.toLowerCase().includes(lowerSearchTerm) ||
            currency.name?.toLowerCase().includes(lowerSearchTerm)
        )
      )
      setShowDropdown(true)
    } else {
      setFilteredCurrencies(allCurrencies) // Show all if search term is empty but focused
      setShowDropdown(false) // Or hide if not focused - handled by onFocus/onBlur
    }
  }, [searchTerm, allCurrencies])

  const handleSelect = (currency: Currency) => {
    if (currency.code) {
      onSelectCurrency(currency.code)
      setSearchTerm(currency.name || currency.code) // Show name or code in input after selection
    }
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  React.useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.parentElement?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
        // If dropdown is closed and search term doesn't match selected currency, reset it
        if (selectedCurrencyCode && allCurrencies) {
          const selected = allCurrencies.find(
            c => c.code === selectedCurrencyCode
          )
          if (searchTerm !== (selected?.name || selected?.code)) {
            setSearchTerm(selected?.name || selected?.code || '')
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchTerm, selectedCurrencyCode, allCurrencies])

  const handleFocus = () => {
    if (allCurrencies) {
      // If searchTerm is empty show all currencies, else show filtered
      setFilteredCurrencies(searchTerm ? filteredCurrencies : allCurrencies)
      setShowDropdown(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!e.target.value) {
      // If input is cleared, treat as ready for new selection
      onSelectCurrency('') // Optionally clear the selection in parent
    }
  }

  return (
    <div className='relative w-full'>
      <Input
        ref={inputRef}
        type='text'
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled || !allCurrencies}
        autoComplete='off'
      />
      {showDropdown && filteredCurrencies.length > 0 && (
        <div className='absolute z-50 mt-1 w-full bg-background border rounded shadow-lg max-h-60 overflow-auto'>
          {filteredCurrencies.map(currency => (
            <div
              key={currency.code}
              className={cn(
                'flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm',
                selectedCurrencyCode === currency.code &&
                  'bg-accent font-semibold'
              )}
              onClick={() => handleSelect(currency)}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selectedCurrencyCode === currency.code
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
              {`${currency.name} (${currency.code})`}
            </div>
          ))}
        </div>
      )}
      {showDropdown && filteredCurrencies.length === 0 && searchTerm && (
        <div className='absolute z-50 mt-1 w-full bg-background border rounded shadow-lg p-2 text-sm text-muted-foreground'>
          No currencies found.
        </div>
      )}
    </div>
  )
}
