import Profile from '@/components/profile/profile'
import useAuth from '@/hooks/use-auth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { checkUserIsLoggedIn } from '@/services/api-auth'

function ProfilePage () {
  const { user } = useAuth()
  return <Profile userId={user?.id ?? null} />
}

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
  beforeLoad: () => {
    if (!checkUserIsLoggedIn()) throw redirect({ to: '/auth/login' })
    return { getTitle: () => 'My Profile' }
  }
})
