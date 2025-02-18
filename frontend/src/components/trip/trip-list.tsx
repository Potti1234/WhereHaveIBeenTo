import type {
  ExpandedTravelItemType,
  TravelItemType,
  CityItemType
} from '@/schemas/trip-schema'
import { CityItem } from './city-item'
import { TravelItem } from './travel-item'
import { AddCityButton } from '@/components/trip/add-city-button'
import { ArrowDown } from 'lucide-react'
import { City } from '@/schemas/city-schema'

interface TripListProps {
  travelItems: ExpandedTravelItemType[]
  cityItems: CityItemType[]
  updateTravelItem: (id: string, updates: Partial<TravelItemType>) => void
  removeTravelItem: (id: string) => void
  updateCity: (index: number, city: City) => void
  addTravelItem: (index: number) => void
}

export function TripList ({
  travelItems,
  cityItems,
  updateTravelItem,
  removeTravelItem,
  updateCity,
  addTravelItem
}: TripListProps) {
  return (
    <div className='space-y-2'>
      {cityItems.map((cityItem, index) => (
        <div key={cityItem.id}>
          <CityItem
            item={cityItem}
            onCityChange={city => updateCity(index, city)}
            isFirst={index === 0}
            isLast={index === cityItems.length - 1}
          />
          <AddCityButton onClick={() => addTravelItem(index)} />
          {index < travelItems.length && (
            <div className='relative ml-8 my-4'>
              <div className='absolute left-[-1rem] top-[-3rem] bottom-[-1rem] w-[2px] bg-gray-200 z-10' />
              <div className='absolute left-[-1rem] top-[-3rem] transform -translate-x-1/2 z-10'>
                <ArrowDown className='w-5 h-5 text-gray-400' />
              </div>
              <div className='absolute left-[-1rem] top-[-1.00rem] transform -translate-x-1/2 z-10'>
                <ArrowDown className='w-5 h-5 text-gray-400' />
              </div>
              <div className='absolute left-[-1rem] bottom-[2.00rem] transform -translate-x-1/2 z-10'>
                <ArrowDown className='w-5 h-5 text-gray-400' />
              </div>
              <div className='absolute left-[-1rem] bottom-[-1.00rem] transform -translate-x-1/2 z-10'>
                <ArrowDown className='w-5 h-5 text-gray-400' />
              </div>
              <TravelItem
                item={travelItems[index]}
                updateItem={updates =>
                  updateTravelItem(
                    travelItems[index].id || `travel-${index}`,
                    updates
                  )
                }
                removeItem={() =>
                  removeTravelItem(travelItems[index].id || `travel-${index}`)
                }
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
