import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import CountryWithStatesMap from '@/components/explore/countryWithStatesMap'
import { useCountry } from '@/hooks/use-country'
import { useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import Spinner from '@/components/shared/spinner'

export const Route = createFileRoute('/explore/country/$countryId')({
  component: CountryPage,
  pendingComponent: Spinner,
  beforeLoad: () => {
    return { getTitle: () => 'Explore Country' }
  }
})

function CountryPage () {
  const { countryId } = useParams({ from: '/explore/country/$countryId' })
  const { country } = useCountry(countryId)

  return (
    <ScrollArea className='h-screen w-100%'>
      <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
        <h1 className='text-3xl font-bold text-center'>
          Explore {country?.name}
        </h1>
        <div className='mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground'>
          <div className='grid grid-cols-3 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>Currency:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h3 className='text-2xl font-bold'>{country?.currency}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Name in Native Language:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h3 className='text-2xl font-bold'>{country?.native}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Nationality:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h3 className='text-2xl font-bold'>{country?.nationality}</h3>
                </div>
              </CardContent>
            </Card>
          </div>
          {country && <CountryWithStatesMap country={country} />}
        </div>
      </main>
    </ScrollArea>
  )
}
