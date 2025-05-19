import { queryOptions } from '@tanstack/react-query'
import { ActivitiesAPIResponse, activitiesAPIResponseSchema } from '@/schemas/activity-schema'
import pb from './pocketbase' 

export type FetchActivitiesParams = {
  cityId: string
  idType: 'pb' | 'viator'
  currency?: string
  count?: number
  enabled?: boolean
}

// This function fetches data using PocketBase SDK and expects data matching `ActivitiesAPIResponse`
async function fetchActivities({
  cityId,
  idType,
  currency = 'USD',
  count = 5
}: Omit<FetchActivitiesParams, 'enabled'>): Promise<ActivitiesAPIResponse> {
  if (!cityId || cityId === '') {
    return { products: [], totalCount: 0 }
  }

  const endpointType = idType === 'pb' ? 'pb_city' : 'viator_city'
  const path = `/api/viator/activities/${endpointType}/${cityId}`

  // Use pb.send to fetch data
  const rawData = await pb.send(path, {
    query: {
      currency: currency,
      count: count
    }
  })
  
  // Parse the response directly using the expected schema
  // pb.send already returns parsed JSON, so no need for response.json()
  // Error handling is implicitly handled by pb.send which throws on non-2xx responses
  const parsedData = activitiesAPIResponseSchema.parse(rawData)

  return parsedData
}

export const activitiesQueryOptions = ({
  cityId,
  idType,
  currency = 'USD',
  count = 5,
  enabled = true
}: FetchActivitiesParams) =>
  queryOptions<ActivitiesAPIResponse, Error, ActivitiesAPIResponse, (string | number | undefined)[]>({
    queryKey: ['activities', idType, cityId, currency, count],
    queryFn: () => fetchActivities({ cityId, idType, currency, count }),
    enabled: enabled && !!cityId && cityId !== ''
  }) 