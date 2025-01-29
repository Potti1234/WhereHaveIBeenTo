import WorldMap from '@/components/map/map'
import { createFileRoute } from '@tanstack/react-router'

function UserMapPage() {
  const { userId } = Route.useParams()
  return <WorldMap userId={userId} />
}

export const Route = createFileRoute('/map/$userId')({
  component: UserMapPage,
  beforeLoad: () => {
    return { getTitle: () => 'User Map' }
  },
})
