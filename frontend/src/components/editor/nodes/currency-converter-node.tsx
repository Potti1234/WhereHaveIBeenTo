'use client'

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrencies } from '@/services/api-currency'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { Currency } from '@/schemas/currency-schema'
import { errorToast } from '@/lib/toast'
import { CurrencyAutocomplete } from '@/components/shared/currency/currency-autocomplete'

export const CurrencyConverterNode = ({
  node,
  updateAttributes,
  deleteNode
}: NodeViewProps) => {
  const [allCurrencies, setAllCurrencies] = useState<Currency[] | null>(null)
  const [fromCurrency, setFromCurrency] = useState(
    node.attrs.fromCurrency || 'USD'
  )
  const [toCurrency, setToCurrency] = useState(node.attrs.toCurrency || 'EUR')
  const [rate, setRate] = useState<number | undefined>(undefined)
  const [fromAmount, setFromAmount] = useState(node.attrs.fromAmount || '1')
  const [toAmount, setToAmount] = useState(node.attrs.toAmount || '')

  useEffect(() => {
    const fetchAllCurrencies = async () => {
      try {
        const currenciesData = await getCurrencies()
        setAllCurrencies(currenciesData)
      } catch (error) {
        console.error('Failed to fetch currencies:', error)
        errorToast('Failed to load currencies', 'Please try again later.')
      }
    }
    fetchAllCurrencies()
  }, [])

  useEffect(() => {
    updateAttributes({
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount
    })
  }, [fromCurrency, toCurrency, fromAmount, toAmount, updateAttributes])

  useEffect(() => {
    if (!allCurrencies || !fromCurrency || !toCurrency) {
      setRate(undefined)
      return
    }

    const fromRate = allCurrencies.find(
      currency => currency.code === fromCurrency
    )?.rate
    const toRate = allCurrencies.find(
      currency => currency.code === toCurrency
    )?.rate

    if (fromRate === undefined || toRate === undefined || fromRate === 0) {
      errorToast('Could not calculate conversion rate', 'Invalid currency data')
      setRate(undefined)
      if (fromRate === undefined || toRate === undefined) {
        setToAmount('')
        updateAttributes({ toAmount: '' })
      }
      return
    }

    const calculatedRate = toRate / fromRate
    setRate(calculatedRate)
    if (calculatedRate !== undefined) {
      updateToAmount(fromAmount, calculatedRate)
    }
  }, [fromCurrency, toCurrency, allCurrencies, fromAmount])

  const updateToAmount = (amount: string, currentRate: number) => {
    const numAmount = parseFloat(amount) || 0
    const newToAmount = (numAmount * currentRate).toFixed(2)
    setToAmount(newToAmount)
    updateAttributes({ toAmount: newToAmount })
  }

  const updateFromAmount = (amount: string, currentRate: number) => {
    const numAmount = parseFloat(amount) || 0
    if (currentRate === 0) {
      setFromAmount('')
      updateAttributes({ fromAmount: '' })
      return
    }
    const newFromAmount = (numAmount / currentRate).toFixed(2)
    setFromAmount(newFromAmount)
    updateAttributes({ fromAmount: newFromAmount })
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (rate !== undefined) updateToAmount(value, rate)
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (rate !== undefined) updateFromAmount(value, rate)
  }

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value)
  }

  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value)
  }

  return (
    <NodeViewWrapper>
      <Card className='my-4 relative'>
        <CardContent className='p-4 pt-10 space-y-4 relative'>
          <Button
            variant='ghost'
            size='icon'
            onClick={deleteNode}
            className='absolute top-2 right-2 h-8 w-8'
          >
            <XIcon className='h-4 w-4' />
          </Button>
          <div className='flex gap-4'>
            <div className='flex-1 space-y-2'>
              <CurrencyAutocomplete
                allCurrencies={allCurrencies}
                selectedCurrencyCode={fromCurrency}
                onSelectCurrency={handleFromCurrencyChange}
                placeholder='From Currency'
                disabled={!allCurrencies}
              />
              <Input
                type='number'
                value={fromAmount}
                onChange={e => handleFromAmountChange(e.target.value)}
                placeholder='Amount'
                disabled={!allCurrencies}
              />
            </div>

            <div className='flex-1 space-y-2'>
              <CurrencyAutocomplete
                allCurrencies={allCurrencies}
                selectedCurrencyCode={toCurrency}
                onSelectCurrency={handleToCurrencyChange}
                placeholder='To Currency'
                disabled={!allCurrencies}
              />
              <Input
                type='number'
                value={toAmount}
                onChange={e => handleToAmountChange(e.target.value)}
                placeholder='Amount'
                disabled={!allCurrencies || rate === undefined}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  )
}
