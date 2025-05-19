import { FlightAttributes } from './types'

interface SearchProps {
  onSelect: (item: FlightAttributes) => void
  onClose: () => void
}

export default function FlightSearch ({ onSelect, onClose }: SearchProps) {
  const flights: FlightAttributes[] = [
    {
      id: 1,
      airline: 'Japan Airlines',
      flightNumber: 'JL7002',
      departure: 'Tokyo',
      arrival: 'Osaka',
      departureTime: '10:30 AM',
      arrivalTime: '11:45 AM',
      price: '$120',
      date: '2025-06-05'
    },
    {
      id: 2,
      airline: 'ANA',
      flightNumber: 'NH105',
      departure: 'Tokyo',
      arrival: 'Kyoto',
      departureTime: '1:20 PM',
      arrivalTime: '2:30 PM',
      price: '$140',
      date: '2025-06-08'
    },
    {
      id: 3,
      airline: 'Japan Airlines',
      flightNumber: 'JL301',
      departure: 'Osaka',
      arrival: 'Sapporo',
      departureTime: '11:05 AM',
      arrivalTime: '1:15 PM',
      price: '$180',
      date: '2025-06-12'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Search Flights</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='mb-4 grid grid-cols-4 gap-2'>
          <input
            type='text'
            placeholder='From'
            className='p-2 border rounded'
            defaultValue='Tokyo'
          />
          <input
            type='text'
            placeholder='To'
            className='p-2 border rounded'
            defaultValue='Osaka'
          />
          <input
            type='date'
            className='p-2 border rounded'
            defaultValue='2025-06-05'
          />
          <button className='bg-blue-600 text-white p-2 rounded'>Search</button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {flights.map(flight => (
            <div
              key={flight.id}
              className='border rounded p-3 mb-2 hover:bg-gray-50 cursor-pointer'
              onClick={() => onSelect(flight)}
            >
              <div className='flex justify-between'>
                <div className='font-medium'>
                  {flight.airline} {flight.flightNumber}
                </div>
                <div className='font-bold'>{flight.price}</div>
              </div>
              <div className='flex justify-between mt-2'>
                <div>
                  <div className='text-lg font-semibold'>
                    {flight.departureTime}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {flight.departure}
                  </div>
                </div>
                <div className='flex items-center text-gray-400'>
                  <div className='border-t border-gray-300 w-16'></div>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mx-1'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.725-.962l-5-1.429a1 1 0 01.725-1.962l5 1.429a1 1 0 00.725-.038l5-1.429a1 1 0 011.169 1.409l-7 14z' />
                  </svg>
                  <div className='border-t border-gray-300 w-16'></div>
                </div>
                <div>
                  <div className='text-lg font-semibold'>
                    {flight.arrivalTime}
                  </div>
                  <div className='text-sm text-gray-600'>{flight.arrival}</div>
                </div>
              </div>
              <div className='text-sm text-gray-500 mt-1'>{flight.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
