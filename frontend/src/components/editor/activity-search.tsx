import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CityAutocomplete } from '@/components/shared/city-autocomplete'
import { useEffect, useState } from 'react'
import type { CityWithCountryAndState } from '@/schemas/city-schema'
import { Activity, ActivitiesAPIResponse } from '@/schemas/activity-schema'
import { fetchActivities } from '@/services/api-activities'

interface SearchProps {
  onSelect: (item: Activity) => void
  onClose: () => void
  open: boolean
}

export default function ActivitySearch ({
  onSelect,
  onClose,
  open
}: SearchProps) {
  const [selectedCity, setSelectedCity] =
    useState<CityWithCountryAndState | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  const handleOpenChange = (openState: boolean) => {
    if (!openState) onClose()
  }

  useEffect(() => {
    if (selectedCity) {
      fetchActivities({ cityId: selectedCity.id || '', idType: 'pb' }).then(
        (data: ActivitiesAPIResponse) => setActivities(data.products)
      )
    }
  }, [selectedCity])

  const handleSearch = () => {
    // Implement search functionality if needed
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Search Activities</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-4 gap-2 mb-4'>
          <div className='col-span-2'>
            <CityAutocomplete
              onSelect={setSelectedCity}
              placeholder='Select a city...'
              selectedCityId={selectedCity?.id}
              disabled={false}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-2'>
            {activities?.map(activity => (
              <Card
                key={activity.id}
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => onSelect(activity)}
              >
                <CardContent className='p-4'>
                  <div className='flex gap-4'>
                    <img
                      src={activity.image || '/placeholder.svg'}
                      alt={activity.title || ''}
                      className='w-24 h-24 object-cover rounded'
                    />
                    <div className='flex-1'>
                      <div className='font-medium text-lg'>
                        {activity.title}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {activity.description}
                      </div>
                      <div className='flex items-center mt-1'>
                        <div className='text-yellow-500'>★</div>
                        <div className='ml-1 text-sm'>
                          {activity.review_stars}
                        </div>
                      </div>
                      <div className='flex justify-between mt-1'>
                        <div className='font-bold'>{activity.price}</div>
                        <div className='text-sm text-muted-foreground'>
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
