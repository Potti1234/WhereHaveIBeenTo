import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CountryRecord } from '@/types/pocketbase-types'
import { Link } from '@tanstack/react-router'

export default function CountryCard (props: { country: CountryRecord }) {
  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>{props.country.name}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link
            to='/explore/country/$countryId'
            params={{ countryId: props.country.id }}
          >
            View Country
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
