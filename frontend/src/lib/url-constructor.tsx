export interface TravelUrlParams {
  fromCity: string
  toCity: string
  date?: string
  passengers?: number
}

const formatCityName = (city: string): string => {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

export const construct12GoUrl = ({
  fromCity,
  toCity,
  date,
  passengers = 1
}: TravelUrlParams): string => {
  const formattedFromCity = formatCityName(fromCity)
  const formattedToCity = formatCityName(toCity)
  const dateParam = date ? `&date=${formatDate(date)}` : ''

  return `https://12go.com/en/travel/${formattedFromCity}/${formattedToCity}?people=${passengers}${dateParam}&direction=forward?z=11294447`
}

export const getProviderUrl = (
  type: string,
  params: TravelUrlParams
): { url: string; provider: string } | null => {
  switch (type) {
    case 'train':
    case 'bus':
      return {
        url: construct12GoUrl(params),
        provider: '12Go Asia'
      }
    default:
      return null
  }
}
