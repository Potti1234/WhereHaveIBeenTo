import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export default function ExplorePage () {
  return (
    <div>
      <Link to='/explore/country'>Explore Countries</Link>
      <Link to='/explore/city'>Explore Cities</Link>
    </div>
  )
}

export const Route = createFileRoute('/explore/')({
  component: ExplorePage,
  beforeLoad: () => {
    return { getTitle: () => 'Explore' }
  }
})
