export interface FlightAttributes {
  id: number
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  price: string
  date: string
}

export interface HotelAttributes {
  id: number
  name: string
  location: string
  price: string
  rating: number
  image?: string
}

export interface ActivityAttributes {
  id: number
  name: string
  location: string
  price: string
  duration: string
  rating: number
  image?: string
} 