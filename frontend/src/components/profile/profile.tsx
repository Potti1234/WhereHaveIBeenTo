'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNavigate } from '@tanstack/react-router'
import { useDistinctVisitedCountries } from '@/hooks/use-distinct-visited-countries'
import { useDistinctVisitedStates } from '@/hooks/use-distinct-visited-states'
import { useVisitedCity } from '@/hooks/use-visited-city'
import React from 'react'

interface ProfileProps {
  userId: string | null
}

export default function Profile ({ userId }: ProfileProps) {
  const navigate = useNavigate()
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(
    null
  )

  const { distinctVisitedCountries } = useDistinctVisitedCountries(userId ?? '')
  const { statesCount, statesInCountry } = useDistinctVisitedStates(
    userId ?? '',
    selectedCountry ?? undefined
  )
  const { visitedCitiesCount } = useVisitedCity(userId ?? '')

  const handleCountryClick = async (countryName: string) => {
    if (selectedCountry === countryName) {
      setSelectedCountry(null)
      return
    }
    setSelectedCountry(countryName)
  }

  return (
    <ScrollArea className='h-screen w-100%'>
      <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
        <h1 className='text-3xl font-bold text-center'>Profile</h1>
        <div className='mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground'>
          <div className='grid grid-cols-3 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>Countries:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h1 className='text-4xl font-bold'>
                    {distinctVisitedCountries.length}
                  </h1>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>States:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h1 className='text-4xl font-bold'>{statesCount}</h1>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cities:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-center'>
                  <h1 className='text-4xl font-bold'>{visitedCitiesCount}</h1>
                </div>
              </CardContent>
            </Card>
          </div>
          {!selectedCountry && (
            <Card>
              <CardHeader>
                <CardTitle>Visited Countries</CardTitle>
                <CardDescription>
                  All of your visited countries. <br />
                  Click on a flag to view the states.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-5 gap-2'>
                  {distinctVisitedCountries.map((country, index) => (
                    <div key={index} className='flex items-center'>
                      <img
                        onClick={() => handleCountryClick(country.name ?? '')}
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.iso2}.svg`}
                        alt='Flag'
                        className='mr-2 h-16 w-16'
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='border-t px-6 py-4'>
                <Button onClick={() => navigate({ to: `/map/${userId}` })}>
                  View on map
                </Button>
              </CardFooter>
            </Card>
          )}
          {selectedCountry && statesInCountry && (
            <Card>
              <CardHeader>
                <CardTitle>Visited States in {selectedCountry}</CardTitle>
                <CardDescription>
                  All of your visited states in {selectedCountry}. <br />
                  Click on the flag to view the countries.
                </CardDescription>
                <img
                  onClick={() => handleCountryClick(selectedCountry)}
                  src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${
                    distinctVisitedCountries.find(
                      c => c.name === selectedCountry
                    )?.iso2
                  }.svg`}
                  alt='Flag'
                  className='mr-2 h-16 w-16'
                />
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-4 gap-4'>
                  {statesInCountry.map((state, index) => (
                    <div key={index} className='flex items-center'>
                      <p>{state.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </ScrollArea>
  )
}
