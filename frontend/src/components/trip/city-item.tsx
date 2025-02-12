import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CityItemType } from '@/schemas/trip-schema'
import { format } from 'date-fns'
import { Card } from '../ui/card'
import { CityInput } from '../shared/city-input'
interface CityItemProps {
  item: CityItemType
  onCityChange: (id: string) => void
  isFirst: boolean
}

export function CityItem ({ item, onCityChange, isFirst }: CityItemProps) {
  return (
    <Card className='relative p-4  rounded-lg shadow'>
      <div className='grid grid-cols-2 gap-4 items-end'>
        <div>
          <Label htmlFor={`city-name-${item.id}`}>City</Label>
          <CityInput
            onSelect={city => {
              console.log(typeof onCityChange)
              if (city.id) {
                onCityChange(city.id)
              }
            }}
            placeholder={isFirst ? 'Starting city' : 'Destination city'}
            selectedCityId={item.cityId}
          />
        </div>
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
      </div>
    </Card>
  )
}
