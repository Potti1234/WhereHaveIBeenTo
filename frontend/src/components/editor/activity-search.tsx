import { ActivityAttributes } from './types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchProps {
  onSelect: (item: ActivityAttributes) => void
  onClose: () => void
  open: boolean
}

export default function ActivitySearch ({
  onSelect,
  onClose,
  open
}: SearchProps) {
  const handleOpenChange = (openState: boolean) => {
    if (!openState) onClose()
  }

  const activities: ActivityAttributes[] = [
    {
      id: 1,
      name: 'Tokyo Skytree Tour',
      location: 'Tokyo',
      price: '$25',
      duration: '2 hours',
      rating: 4.6,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 2,
      name: 'Fushimi Inari Shrine Visit',
      location: 'Kyoto',
      price: '$15',
      duration: '3 hours',
      rating: 4.9,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 3,
      name: 'Osaka Castle Tour',
      location: 'Osaka',
      price: '$20',
      duration: '2 hours',
      rating: 4.7,
      image: '/placeholder.svg?height=100&width=150'
    }
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Search Activities</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-4 gap-2 mb-4'>
          <Input
            type='text'
            placeholder='Location'
            defaultValue='Tokyo'
            className='col-span-2'
          />
          <Input type='text' placeholder='Activity type' />
          <Button>Search</Button>
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-2'>
            {activities.map(activity => (
              <Card
                key={activity.id}
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => onSelect(activity)}
              >
                <CardContent className='p-4'>
                  <div className='flex gap-4'>
                    <img
                      src={activity.image || '/placeholder.svg'}
                      alt={activity.name}
                      className='w-24 h-24 object-cover rounded'
                    />
                    <div className='flex-1'>
                      <div className='font-medium text-lg'>{activity.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {activity.location}
                      </div>
                      <div className='flex items-center mt-1'>
                        <div className='text-yellow-500'>★</div>
                        <div className='ml-1 text-sm'>{activity.rating}</div>
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
