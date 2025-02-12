import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'

interface TripCardProps {
  id: string
  title: string
  description: string | undefined
  onDelete: (id: string) => void
}

export function TripCard ({ id, title, description, onDelete }: TripCardProps) {
  const navigate = useNavigate()

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>{title}</CardTitle>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate({ to: `/trip/edit/${id}` })}
            title='Edit trip'
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='ghost' size='icon' title='Delete trip'>
                <Trash2 className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this trip? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className='line-clamp-5 break-words'>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
