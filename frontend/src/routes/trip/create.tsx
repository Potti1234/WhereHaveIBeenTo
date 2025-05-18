import { createFileRoute, redirect } from '@tanstack/react-router'
import TripPlanner from '@/components/trip/trip-planner'
import { ExpandedTravelItemType, ExpandedTripType } from '@/schemas/trip-schema'
import useAuth from '@/hooks/use-auth'
import TravelEditor from '@/components/editor/travel-editor'
import { checkUserIsLoggedIn } from '@/services/api-auth'

export const Route = createFileRoute('/trip/create')({
  component: RouteComponent,
  beforeLoad: () => {
    if (!checkUserIsLoggedIn()) throw redirect({ to: '/auth/login' })
    return { getTitle: () => 'Create Trip' }
  }
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
  return <TravelEditor />
  //return <TripPlanner mode='create' trip={trip} travelItems={travelItems} />
}
