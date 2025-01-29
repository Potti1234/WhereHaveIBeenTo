import Profile from '@/components/profile/profile'
import { createFileRoute } from '@tanstack/react-router'

function UserProfilePage() {
  const { userId } = Route.useParams()
  return <Profile userId={userId} />
}

export const Route = createFileRoute('/profile/$userId')({
  component: UserProfilePage,
  beforeLoad: () => {
    return { getTitle: () => 'User Profile' }
  },
})
