import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddCityButtonProps {
  onClick: () => void
}

export function AddCityButton ({ onClick }: AddCityButtonProps) {
  return (
    <Button
      variant='ghost'
      size='sm'
      className='w-full flex items-center justify-center py-1 text-gray-400 hover:text-gray-600 transition-colors'
      onClick={onClick}
    >
      <Plus className='h-4 w-4 mr-1' />
      Add City
    </Button>
  )
}
