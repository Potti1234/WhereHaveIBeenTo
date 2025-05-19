import { HotelAttributes } from './types'
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
  onSelect: (item: HotelAttributes) => void
  onClose: () => void
  open: boolean
}

export default function HotelSearch ({ onSelect, onClose, open }: SearchProps) {
  const handleOpenChange = (openState: boolean) => {
    if (!openState) onClose()
  }

  const hotels: HotelAttributes[] = [
    {
      id: 1,
      name: 'Park Hyatt Tokyo',
      location: 'Tokyo',
      price: '$350/night',
      rating: 4.8,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 2,
      name: 'Conrad Osaka',
      location: 'Osaka',
      price: '$320/night',
      rating: 4.7,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 3,
      name: 'The Ritz-Carlton Kyoto',
      location: 'Kyoto',
      price: '$420/night',
      rating: 4.9,
      image: '/placeholder.svg?height=100&width=150'
    }
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Search Hotels</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-4 gap-2 mb-4'>
          <Input
            type='text'
            placeholder='Destination'
            defaultValue='Tokyo'
            className='col-span-2'
          />
          <Input type='date' defaultValue='2025-06-01' />
          <Button>Search</Button>
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-2'>
            {hotels.map(hotel => (
              <Card
                key={hotel.id}
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => onSelect(hotel)}
              >
                <CardContent className='p-4'>
                  <div className='flex gap-4'>
                    <img
                      src={hotel.image || '/placeholder.svg'}
                      alt={hotel.name}
                      className='w-24 h-24 object-cover rounded'
                    />
                    <div className='flex-1'>
                      <div className='font-medium text-lg'>{hotel.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {hotel.location}
                      </div>
                      <div className='flex items-center mt-1'>
                        <div className='text-yellow-500'>★</div>
                        <div className='ml-1 text-sm'>{hotel.rating}</div>
                      </div>
                      <div className='font-bold mt-1'>{hotel.price}</div>
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
