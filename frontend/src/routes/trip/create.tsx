import { createFileRoute } from '@tanstack/react-router'
import TripPlanner from '@/components/trip/trip-planner'
import { ExpandedTravelItemType, ExpandedTripType } from '@/schemas/trip-schema'
import useAuth from '@/hooks/use-auth'
export const Route = createFileRoute('/trip/create')({
  component: RouteComponent
})

function RouteComponent () {
  const { user } = useAuth()

  const travelItems: ExpandedTravelItemType[] = [
    {
      type: 'bus',
      start_date: null,
      arrival_date: null,
      order: 0,
      from: '',
      to: '',
      expand: {
        from: {
          id: ''
        },
        to: { id: '' }
      }
    }
  ]

  const trip: ExpandedTripType = {
    name: '',
    description: '',
    travel_items: [],
    user: user?.id,
    expand: {
      travel_items: travelItems
    }
  }
  return <TripPlanner mode='create' trip={trip} travelItems={travelItems} />
}
