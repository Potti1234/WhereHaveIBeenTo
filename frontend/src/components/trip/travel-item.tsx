import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plane, Train, Bus, Car, Minus } from 'lucide-react'
import type { TravelItemType } from '@/schemas/trip-schema'
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
interface TravelItemProps {
  item: TravelItemType
  updateItem: (updates: Partial<TravelItemType>) => void
  removeItem: () => void
}

const travelIcons = {
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car
}

export function TravelItem ({ item, updateItem, removeItem }: TravelItemProps) {
  const Icon = travelIcons[item.type]

  return (
    <Card className='relative p-4 rounded-lg shadow'>
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-2 right-2'
        onClick={removeItem}
      >
        <Minus className='h-4 w-4' />
      </Button>
      <div className='grid grid-cols-2 gap-4 items-end'>
        <div className='flex items-center space-x-2'>
          <Icon className='w-6 h-6 flex-shrink-0' />
          <Select
            value={item.type}
            onValueChange={value =>
              updateItem({ type: value as TravelItemType['type'] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select travel mode' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='plane'>Plane</SelectItem>
              <SelectItem value='train'>Train</SelectItem>
              <SelectItem value='bus'>Bus</SelectItem>
              <SelectItem value='car'>Car</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !item.start_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {item.start_date ? (
                  format(item.start_date, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
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
    </Card>
  )
}
