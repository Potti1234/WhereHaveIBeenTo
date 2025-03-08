import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CityItemType } from '@/schemas/trip-schema'
import { format } from 'date-fns'
import { Card } from '../ui/card'
import { CityInput } from '../shared/city-input'
import { City } from '@/schemas/city-schema'

interface CityItemProps {
  item: CityItemType
  onCityChange: (city: City) => void
  isFirst: boolean
  isLast: boolean
  disabled: boolean
}

export function CityItem ({
  item,
  onCityChange,
  isFirst,
  isLast,
  disabled
}: CityItemProps) {
  return (
    <Card className='relative p-4 rounded-lg shadow'>
      <div className='grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 items-end'>
        <div>
          <Label htmlFor={`city-name-${item.id}`}>City</Label>
          <CityInput
            onSelect={city => {
              if (city.id) {
                onCityChange(city)
              }
            }}
            placeholder={isFirst ? 'Starting city' : 'Destination city'}
            selectedCityId={item.cityId}
            disabled={disabled}
          />
        </div>

        {isFirst || isLast ? (
          <div>
            <Label htmlFor={`start-date-${item.id}`}>
              {isFirst ? 'Trip Start Date' : 'Arrival Date'}
            </Label>
            <Input
              id={`start-date-${item.id}`}
              type='date'
              value={
                item.startDate
                  ? format(new Date(item.startDate), 'yyyy-MM-dd')
                  : ''
              }
              readOnly
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor={`arrival-date-${item.id}`}>Arrival Date</Label>
              <Input
                id={`arrival-date-${item.id}`}
                type='date'
                value={
                  item.startDate
                    ? format(new Date(item.startDate), 'yyyy-MM-dd')
                    : ''
                }
                readOnly
              />
            </div>
            <div>
              <Label htmlFor={`departure-date-${item.id}`}>
                Departure Date
              </Label>
              <Input
                id={`departure-date-${item.id}`}
                type='date'
                value={
                  item.endDate
                    ? format(new Date(item.endDate), 'yyyy-MM-dd')
                    : ''
                }
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
