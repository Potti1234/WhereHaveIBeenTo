import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { useTrip } from '@/hooks/use-trip'
import TripPlanner from '@/components/trip/trip-planner'

export const Route = createFileRoute('/trip/view/$tripId')({
  component: RouteComponent
})

function RouteComponent () {
  const { tripId } = useParams({ from: '/trip/view/$tripId' })
  const { trip } = useTrip(tripId)

  if (!trip) {
    return <div>Trip not found</div>
  }

  return (
    <TripPlanner
      trip={trip}
      travelItems={trip.expand.travel_items || []}
      mode='view'
    />
  )
}
