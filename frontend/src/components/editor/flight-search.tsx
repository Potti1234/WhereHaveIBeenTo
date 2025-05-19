import { FlightAttributes } from './types'
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
  onSelect: (item: FlightAttributes) => void
  onClose: () => void
  open: boolean
}

export default function FlightSearch ({ onSelect, onClose, open }: SearchProps) {
  const handleOpenChange = (openState: boolean) => {
    if (!openState) onClose()
  }

  const flights: FlightAttributes[] = [
    {
      id: 1,
      airline: 'Japan Airlines',
      flightNumber: 'JL7002',
      departure: 'Tokyo',
      arrival: 'Osaka',
      departureTime: '10:30 AM',
      arrivalTime: '11:45 AM',
      price: '$120',
      date: '2025-06-05'
    },
    {
      id: 2,
      airline: 'ANA',
      flightNumber: 'NH105',
      departure: 'Tokyo',
      arrival: 'Kyoto',
      departureTime: '1:20 PM',
      arrivalTime: '2:30 PM',
      price: '$140',
      date: '2025-06-08'
    },
    {
      id: 3,
      airline: 'Japan Airlines',
      flightNumber: 'JL301',
      departure: 'Osaka',
      arrival: 'Sapporo',
      departureTime: '11:05 AM',
      arrivalTime: '1:15 PM',
      price: '$180',
      date: '2025-06-12'
    }
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Search Flights</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-4 gap-2 mb-4'>
          <Input type='text' placeholder='From' defaultValue='Tokyo' />
          <Input type='text' placeholder='To' defaultValue='Osaka' />
          <Input type='date' defaultValue='2025-06-05' />
          <Button>Search</Button>
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-2'>
            {flights.map(flight => (
              <Card
                key={flight.id}
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => onSelect(flight)}
              >
                <CardContent className='p-4'>
                  <div className='flex justify-between'>
                    <div className='font-medium'>
                      {flight.airline} {flight.flightNumber}
                    </div>
                    <div className='font-bold'>{flight.price}</div>
                  </div>
                  <div className='flex justify-between mt-2'>
                    <div>
                      <div className='text-lg font-semibold'>
                        {flight.departureTime}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {flight.departure}
                      </div>
                    </div>
                    <div className='flex items-center text-muted-foreground'>
                      <div className='border-t border-border w-16'></div>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mx-1'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.429a1 1 0 01.725-1.962l5 1.429a1 1 0 00.725-.038l5-1.429a1 1 0 011.169 1.409l-7 14z' />
                      </svg>
                      <div className='border-t border-border w-16'></div>
                    </div>
                    <div>
                      <div className='text-lg font-semibold'>
                        {flight.arrivalTime}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {flight.arrival}
                      </div>
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground mt-1'>
                    {flight.date}
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
