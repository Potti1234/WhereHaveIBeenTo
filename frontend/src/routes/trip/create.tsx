import { createFileRoute } from '@tanstack/react-router'
import TripPlanner from '@/components/trip/trip-planner'

export const Route = createFileRoute('/trip/create')({
  component: TripPlanner
})
