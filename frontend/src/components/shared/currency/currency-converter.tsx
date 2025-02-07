import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/use-currency'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface CurrencyConverterProps {
  defaultToCurrency?: string
}

export function CurrencyConverter ({
  defaultToCurrency = 'EUR'
}: CurrencyConverterProps) {
  const { currencies, getCurrencyConversionFromTo } = useCurrency()
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState(defaultToCurrency)
  const [rate, setRate] = useState<number | undefined>(undefined)
  const [fromAmount, setFromAmount] = useState('1')
  const [toAmount, setToAmount] = useState('')

  useEffect(() => {
    const fetchRate = async () => {
      const conversion = await getCurrencyConversionFromTo(
        fromCurrency,
        toCurrency
      )
      setRate(conversion)
      updateToAmount(fromAmount, conversion)
    }
    fetchRate()
  }, [fromCurrency, toCurrency])

  const updateToAmount = (amount: string, currentRate: number) => {
    const numAmount = parseFloat(amount) || 0
    setToAmount((numAmount * currentRate).toFixed(2))
  }

  const updateFromAmount = (amount: string, currentRate: number) => {
    const numAmount = parseFloat(amount) || 0
    setFromAmount((numAmount / currentRate).toFixed(2))
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (rate) updateToAmount(value, rate)
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (rate) updateFromAmount(value, rate)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1 space-y-2'>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder='From Currency' />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map(currency => (
                  <SelectItem key={currency.code} value={currency.code || ''}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type='number'
              value={fromAmount}
              onChange={e => handleFromAmountChange(e.target.value)}
              placeholder='Amount'
            />
          </div>

          <div className='flex-1 space-y-2'>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder='To Currency' />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map(currency => (
                  <SelectItem key={currency.code} value={currency.code || ''}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type='number'
              value={toAmount}
              onChange={e => handleToAmountChange(e.target.value)}
              placeholder='Amount'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
