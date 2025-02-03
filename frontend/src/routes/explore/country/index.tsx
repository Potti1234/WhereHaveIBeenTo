import { ScrollArea } from '@/components/ui/scroll-area'
import CountryCard from '@/components/explore/countryCard'
import { useCountry } from '@/hooks/use-country'
import React from 'react'
import { CountryRecord } from '@/types/pocketbase-types'
import { createFileRoute } from '@tanstack/react-router'
import Spinner from '@/components/shared/spinner'

function CountryOverviewPage () {
  const { getRandomCountryList } = useCountry('')
  const [countries, setCountries] = React.useState<CountryRecord[]>([])

  React.useEffect(() => {
    getRandomCountryList(20).then(countries => {
      setCountries(
        countries.filter((c): c is CountryRecord => c.id !== undefined)
      )
    })
  }, [])

  return (
    <ScrollArea className='h-screen w-100%'>
      <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
        <h1 className='text-3xl font-bold text-center'>Explore Countries</h1>
        <div className='mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground'>
          <div className='grid grid-cols-3 gap-4'>
            {countries.map((country, index) => (
              <div key={index}>
                <CountryCard country={country} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </ScrollArea>
  )
}

export const Route = createFileRoute('/explore/country/')({
  component: CountryOverviewPage,
  pendingComponent: Spinner,
  beforeLoad: () => {
    return { getTitle: () => 'Explore Countries' }
  }
})
