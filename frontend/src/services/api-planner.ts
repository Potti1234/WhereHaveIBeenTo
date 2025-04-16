import pb from './pocketbase'
import { ExpandedTripType, ExpandedTravelItemType } from '@/schemas/trip-schema';
import { City } from '@/schemas/city-schema';

export async function createTrip(prompt: string): Promise<ExpandedTripType> {
  const response = await pb.send('/api/planner/generate', {
    method: 'POST',
    body: {
      "prompt": prompt
    }
  })

  const apiResponseData: any = response;

  if (
    !apiResponseData || typeof apiResponseData !== 'object' ||
    !Array.isArray(apiResponseData.days) ||
    !Array.isArray(apiResponseData.travel_items) ||
    typeof apiResponseData.name !== 'string' ||
    typeof apiResponseData.description !== 'string'
  ) {
    console.error("Received API response does not match expected structure:", apiResponseData);
    throw new Error("Failed to generate trip: Invalid API response structure.");
  }

  const transformedTravelItems: ExpandedTravelItemType[] = apiResponseData.travel_items.map((item: any): ExpandedTravelItemType => {
    if (!item || typeof item !== 'object' || !item.from_record || !item.to_record) {
        console.warn("Skipping invalid travel item:", item);
        throw new Error(`Invalid travel item structure received: ${JSON.stringify(item)}`);
    }

    const fromCity: City = {
      id: item.from_record.id,
      name: item.from_record.name,
      latitude: item.from_record.latitude,
      longitude: item.from_record.longitude,
      country: item.from_record.country,
      state: item.from_record.state,
      wikiDataId: item.from_record.wikiDataId,
      created: item.from_record.created,
      updated: item.from_record.updated
    };

    const toCity: City = {
      id: item.to_record.id,
      name: item.to_record.name,
      latitude: item.to_record.latitude,
      longitude: item.to_record.longitude,
      country: item.to_record.country,
      state: item.to_record.state,
      wikiDataId: item.to_record.wikiDataId,
      created: item.to_record.created,
      updated: item.to_record.updated
    };

    return {
      type: item.type,
      start_date: item.start_day ? new Date(Date.now() + ((item.start_day - 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : null,
      arrival_date: item.arrival_day ? new Date(Date.now() + ((item.arrival_day - 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : null,
      order: item.order,
      from: fromCity.id,
      to: toCity.id,
      expand: {
        from: fromCity,
        to: toCity
      }
    };
  });

  const transformedTrip: ExpandedTripType = {
    name: apiResponseData.name,
    description: apiResponseData.description,
    travel_items: [],
    expand: {
      travel_items: transformedTravelItems
    }
  };

  return transformedTrip;
}


