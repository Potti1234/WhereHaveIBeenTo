import WorldMap from '@/components/map/map'
import useAuth from '@/hooks/use-auth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { checkUserIsLoggedIn } from '@/services/api-auth'

function MapPage () {
  const { user } = useAuth()
  return <WorldMap userId={user?.id ?? null} />
}

export const Route = createFileRoute('/map/')({
  component: MapPage,
  beforeLoad: () => {
    if (!checkUserIsLoggedIn()) throw redirect({ to: '/auth/login' })
    return { getTitle: () => 'My Map' }
  }
})
