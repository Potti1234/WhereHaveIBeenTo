import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CityRecord } from '@/types/pocketbase-types'
import { Link } from '@tanstack/react-router'

export default function CityCard (props: { city: CityRecord }) {
  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>{props.city.name}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link to='/explore/city/$cityId' params={{ cityId: props.city.id }}>
            View City
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
