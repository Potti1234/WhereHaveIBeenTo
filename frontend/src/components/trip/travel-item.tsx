import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plane, Train, Bus, Car, Minus, ExternalLink } from 'lucide-react'
import type {
  ExpandedTravelItemType,
  TravelItemType
} from '@/schemas/trip-schema'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '../ui/card'
import { getProviderUrl } from '@/lib/url-constructor'

interface TravelItemProps {
  item: ExpandedTravelItemType
  disabled: boolean
  updateItem: (updates: Partial<ExpandedTravelItemType>) => void
  removeItem: () => void
}

const travelIcons: Record<ExpandedTravelItemType['type'], React.ElementType> = {
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car
}

export function TravelItem ({
  item,
  updateItem,
  removeItem,
  disabled
}: TravelItemProps) {
  const Icon = travelIcons[item.type] as React.ElementType
  const providerInfo = getProviderUrl(item.type, {
    fromCity: item.expand.from.unaccented_name ?? '',
    toCity: item.expand.to.unaccented_name ?? '',
    date: item.start_date ?? '',
    passengers: 1
  })

  return (
    <Card className='relative p-4 rounded-lg shadow'>
      {!disabled && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute top-2 right-2 z-10'
          onClick={removeItem}
        >
          <Minus className='h-4 w-4' />
        </Button>
      )}
      <div className='flex flex-col md:flex-row gap-2'>
        <div className='flex flex-row gap-1 items-center w-full md:w-4/5 pr-8'>
          <div className='flex items-center space-x-2 w-full md:w-1/2'>
            <Icon className='w-6 h-6 flex-shrink-0' />
            <div className='w-[80px] md:w-full'>
              <Select
                value={item.type}
                onValueChange={value =>
                  updateItem({ type: value as TravelItemType['type'] })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Transport' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='plane'>Plane</SelectItem>
                  <SelectItem value='train'>Train</SelectItem>
                  <SelectItem value='bus'>Bus</SelectItem>
                  <SelectItem value='car'>Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='w-full md:w-1/2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[160px] md:w-full justify-start text-left font-normal',
                    !item.start_date && 'text-muted-foreground'
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {item.start_date ? (
                    format(item.start_date, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' sideOffset={4}>
                <Calendar
                  mode='single'
                  selected={
                    item.start_date ? new Date(item.start_date) : undefined
                  }
                  onSelect={(date: Date | undefined) =>
                    updateItem({
                      start_date: date?.toISOString(),
                      arrival_date: date?.toISOString()
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {providerInfo && (
          <div className='w-full md:w-1/5 mt-2 md:mt-0'>
            <a
              href={providerInfo.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center w-full md:w-auto'
            >
              <Button variant='outline' size='sm' className='w-full md:w-auto'>
                Book {item.type} with {providerInfo.provider}
                <ExternalLink className='ml-2 h-4 w-4' />
              </Button>
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}
