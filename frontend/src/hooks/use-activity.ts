import { useSuspenseQuery } from '@tanstack/react-query'
import {
  activitiesQueryOptions,
  FetchActivitiesParams
} from '@/services/api-activities'
import { Activity } from '@/schemas/activity-schema'

interface UseActivitiesParams extends Omit<FetchActivitiesParams, 'enabled'> {
  enabled?: boolean
}

interface UseActivitiesReturn {
  activities: Activity[] | undefined
  totalCount: number | undefined
}

export function useActivities({
  cityId,
  idType,
  currency = 'USD',
  count = 5,
  enabled = true
}: UseActivitiesParams): UseActivitiesReturn {
  const queryResult = useSuspenseQuery(
    activitiesQueryOptions({ cityId, idType, currency, count, enabled })
  )

  return {
    activities: queryResult.data?.products,
    totalCount: queryResult.data?.totalCount
  }
} 