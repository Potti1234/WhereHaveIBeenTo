import { ActivityAttributes } from './types'

interface SearchProps {
  onSelect: (item: ActivityAttributes) => void
  onClose: () => void
}

export default function ActivitySearch ({ onSelect, onClose }: SearchProps) {
  const activities: ActivityAttributes[] = [
    {
      id: 1,
      name: 'Tokyo Skytree Tour',
      location: 'Tokyo',
      price: '$25',
      duration: '2 hours',
      rating: 4.6,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 2,
      name: 'Fushimi Inari Shrine Visit',
      location: 'Kyoto',
      price: '$15',
      duration: '3 hours',
      rating: 4.9,
      image: '/placeholder.svg?height=100&width=150'
    },
    {
      id: 3,
      name: 'Osaka Castle Tour',
      location: 'Osaka',
      price: '$20',
      duration: '2 hours',
      rating: 4.7,
      image: '/placeholder.svg?height=100&width=150'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Search Activities</h3>
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
            placeholder='Location'
            className='p-2 border rounded col-span-2'
            defaultValue='Tokyo'
          />
          <input
            type='text'
            placeholder='Activity type'
            className='p-2 border rounded'
          />
          <button className='bg-blue-600 text-white p-2 rounded'>Search</button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {activities.map(activity => (
            <div
              key={activity.id}
              className='border rounded p-3 mb-2 hover:bg-gray-50 cursor-pointer flex'
              onClick={() => onSelect(activity)}
            >
              <img
                src={activity.image || '/placeholder.svg'}
                alt={activity.name}
                className='w-24 h-24 object-cover rounded mr-3'
              />
              <div className='flex-1'>
                <div className='font-medium text-lg'>{activity.name}</div>
                <div className='text-sm text-gray-600'>{activity.location}</div>
                <div className='flex items-center mt-1'>
                  <div className='text-yellow-500'>★</div>
                  <div className='ml-1 text-sm'>{activity.rating}</div>
                </div>
                <div className='flex justify-between mt-1'>
                  <div className='font-bold'>{activity.price}</div>
                  <div className='text-sm text-gray-600'>
                    {activity.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
