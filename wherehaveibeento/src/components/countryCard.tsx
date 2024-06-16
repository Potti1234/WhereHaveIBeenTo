import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Country } from "@/types/customn"

export default function CountryCard( props: { country : Country }) {
    return (
        <Card>
            <CardContent>
                <CardHeader>
                    <CardTitle>{props.country.name}</CardTitle>
                </CardHeader>
                <CardFooter>
                    <Link href={`/explore/country/${props.country.id}`}>View Country</Link>
                </CardFooter>
            </CardContent>
        </Card>
    )
    }
