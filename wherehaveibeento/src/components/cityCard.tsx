import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { City } from "@/types/customn"

export default function CityCard( props: { city : City }) {
    return (
        <Card>
            <CardContent>
                <CardHeader>
                    <CardTitle>{props.city.name}</CardTitle>
                </CardHeader>
                <CardFooter>
                    <Link href={`/explore/city/${props.city.id}`}>View City</Link>
                </CardFooter>
            </CardContent>
        </Card>
    )
    }
