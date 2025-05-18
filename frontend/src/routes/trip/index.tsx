import { createFileRoute, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { TripCard } from '@/components/trip/trip-card'
import { useTrip } from '@/hooks/use-trip'
import { Heart } from 'lucide-react'
import { checkUserIsLoggedIn } from '@/services/api-auth'

export const Route = createFileRoute('/trip/')({
  component: TripOverview,
  beforeLoad: () => {
    if (!checkUserIsLoggedIn()) throw redirect({ to: '/auth/login' })
    return { getTitle: () => 'All Trips' }
  }
})

function TripOverview () {
  const navigate = useNavigate()
  const { trips, deleteTrip } = useTrip()

  if (trips.length === 0) {
    return (
      <div className='container mx-auto p-4'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Your Trips</h1>
          <Button onClick={() => navigate({ to: '/trip/create' })}>
            Create New Trip
          </Button>
        </div>

        <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
          <Heart className='w-16 h-16 text-muted-foreground mb-4' />
          <h2 className='text-xl font-semibold mb-2'>
            You haven't created any trips yet.
          </h2>
          <p className='text-muted-foreground mb-6'>
            Start planning your next adventure!
          </p>
          <Button onClick={() => navigate({ to: '/trip/create' })}>
            Plan Your First Trip
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Your Trips</h1>
        <Button onClick={() => navigate({ to: '/trip/create' })}>
          Create New Trip
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {trips.map(trip => (
          <TripCard
            key={trip.id ?? ''}
            id={trip.id ?? ''}
            title={trip.name ?? 'Untitled Trip'}
            description={trip.description ?? 'No description'}
            onDelete={deleteTrip}
          />
        ))}
      </div>
    </div>
  )
}
