import { ScrollArea } from '@/components/ui/scroll-area'
import CityCard from '@/components/explore/cityCard'
import { useCity } from '@/hooks/use-city'
import React from 'react'
import { CityRecord } from '@/types/pocketbase-types'
import { createFileRoute } from '@tanstack/react-router'
import Spinner from '@/components/shared/spinner'

export default function CityOverviewPage () {
  const { getRandomCityList } = useCity('')
  const [cities, setCities] = React.useState<CityRecord[]>([])

  React.useEffect(() => {
    getRandomCityList(20).then(cities => {
      setCities(cities.filter((c): c is CityRecord => c.id !== undefined))
    })
  }, [])

  return (
    <ScrollArea className='h-screen w-100%'>
      <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
        <h1 className='text-3xl font-bold text-center'>Explore Cities</h1>
        <div className='mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground'>
          <div className='grid grid-cols-3 gap-4'>
            {cities.map((city, index) => (
              <div key={index}>
                <CityCard city={city} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </ScrollArea>
  )
}

export const Route = createFileRoute('/explore/city/')({
  component: CityOverviewPage,
  pendingComponent: Spinner,
  beforeLoad: () => {
    return { getTitle: () => 'Explore Cities' }
  }
})
