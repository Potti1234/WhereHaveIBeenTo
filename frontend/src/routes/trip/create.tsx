import { createFileRoute, redirect } from '@tanstack/react-router'
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
  return <TravelEditor />
}
